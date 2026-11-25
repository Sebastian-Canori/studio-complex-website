<?php
// Descarga de recursos gratis del blog (lead magnets): checklist, planillas, etc.
//
// Qué hace con cada pedido:
//   1. Valida nombre, mail, consentimiento y reCAPTCHA (acción "recurso").
//   2. Guarda el contacto en el CRM como suscriptor (sc_send_to_crm, tipo
//      "newsletter"), con el recurso, la nota de origen y la campaña.
//   3. Si existe brevo-config.php, lo suma a la lista de Brevo del recurso:
//      la secuencia de mails la manda Brevo (ver docs/embudo-recursos.md).
//   4. Le manda el link de descarga por mail (SMTP2GO) y avisa a hola@.
//   5. Devuelve el link para que la página lo muestre al instante.
//
// brevo-config.php vive solo en el servidor (.gitignore bloquea *config*.php):
//
//   <?php return ['api_key' => '<clave API v3 de Brevo>',
//                 'listas'  => ['checklist-tienda-online' => 3]];
//
// Sin ese archivo todo funciona igual, salvo la secuencia de Brevo.
require __DIR__ . '/smtp-mailer.php';
require __DIR__ . '/recaptcha-verify.php';
require __DIR__ . '/crm-lead.php';

header('Content-Type: application/json; charset=utf-8');

const SC_SITIO = 'https://studiocomplex.com.ar/';

// Recursos que se pueden pedir. La clave es la que manda el formulario.
const SC_RECURSOS = [
    'checklist-tienda-online' => [
        'titulo'  => 'Checklist: tu tienda online lista para vender',
        'asunto'  => 'Acá tenés tu checklist para la tienda online',
        'archivo' => 'assets/recursos/checklist-tienda-online.pdf',
    ],
];

function respond($status, $message, array $extra = []) {
    echo json_encode(['status' => $status, 'message' => $message] + $extra, JSON_UNESCAPED_UNICODE);
    exit;
}

function sc_limpiar($valor, $max = 200) {
    $valor = trim(strip_tags((string) $valor));
    $valor = preg_replace('/[\r\n\t]+/', ' ', $valor);
    return mb_substr($valor, 0, $max);
}

// Alta o actualización del contacto en Brevo. Nunca frena la descarga.
function sc_brevo_suscribir($email, $nombre, $recurso, $nota) {
    $configFile = __DIR__ . '/brevo-config.php';
    if (!is_file($configFile) || !function_exists('curl_init')) {
        return false;
    }
    $config = require $configFile;
    $apiKey = is_array($config) ? trim($config['api_key'] ?? '') : '';
    $lista  = is_array($config) ? (int) ($config['listas'][$recurso] ?? 0) : 0;
    if ($apiKey === '' || $lista <= 0) {
        return false;
    }

    $payload = [
        'email'         => $email,
        'attributes'    => ['NOMBRE' => $nombre, 'RECURSO' => $recurso, 'NOTA_ORIGEN' => $nota],
        'listIds'       => [$lista],
        'updateEnabled' => true,
    ];
    $ch = curl_init('https://api.brevo.com/v3/contacts');
    curl_setopt_array($ch, [
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => json_encode($payload, JSON_UNESCAPED_UNICODE),
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CONNECTTIMEOUT => 3,
        CURLOPT_TIMEOUT        => 6,
        CURLOPT_HTTPHEADER     => [
            'Content-Type: application/json',
            'Accept: application/json',
            'api-key: ' . $apiKey,
        ],
    ]);
    $response = curl_exec($ch);
    $status   = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
    if ($response === false || $status < 200 || $status >= 300) {
        error_log('recurso-form.php: Brevo HTTP ' . $status . ' ' . curl_error($ch));
        return false;
    }
    return true;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond('error', 'Método no permitido.');
}

$recurso = sc_limpiar($_POST['recurso'] ?? '', 60);
$nombre  = sc_limpiar($_POST['nombre'] ?? '', 80);
$email   = trim($_POST['email'] ?? '');
$nota    = sc_limpiar($_POST['nota'] ?? '', 120);
$consent = ($_POST['consentimiento'] ?? '') === 'si';

if (!isset(SC_RECURSOS[$recurso])) {
    respond('error', 'No encontramos ese recurso. Recargá la página e intentá de nuevo.');
}
if ($nombre === '') {
    respond('error', 'Contanos tu nombre.');
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    respond('error', 'Ingresá un email válido.');
}
if (!$consent) {
    respond('error', 'Para mandarte el recurso necesitamos que aceptes recibir nuestros mails.');
}
if (!sc_verify_recaptcha($_POST['recaptcha_token'] ?? '', 'recurso')) {
    respond('error', 'No pudimos validar el pedido. Recargá la página e intentá de nuevo.');
}

$datos  = SC_RECURSOS[$recurso];
$enlace = SC_SITIO . $datos['archivo'];

// Campaña de origen (la guarda sc-cookies.js mientras la pestaña está abierta).
$campana = [];
foreach (['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'gclid', 'fbclid', 'landing_page'] as $clave) {
    if (!empty($_POST[$clave])) {
        $campana[$clave] = sc_limpiar($_POST[$clave]);
    }
}

$crmSent = sc_send_to_crm('newsletter', [
    'email'   => $email,
    'name'    => $nombre,
    'consent' => true,
    'source'  => 'Web - recurso: ' . $datos['titulo'],
    'recurso' => $recurso,
    'nota'    => $nota,
] + $campana);

$brevoSent = sc_brevo_suscribir($email, $nombre, $recurso, $nota);

// Mail con el link: es lo que la persona pidió, así que va siempre.
$mailSent = false;
try {
    sc_send_smtp_mail(
        $email,
        $datos['asunto'],
        "¡Hola, {$nombre}!\n\n"
        . "Acá tenés el {$datos['titulo']}:\n{$enlace}\n\n"
        . "Imprimilo o abrilo en la compu y andá tildando lo que ya tenés resuelto. "
        . "En los próximos días te mandamos algunos mails cortos con ideas para avanzar con lo que quede pendiente.\n\n"
        . "Si querés verlo con nosotros, agendá 30 minutos acá: " . SC_SITIO . "agenda.html\n\n"
        . "Si no pediste este recurso o no querés recibir más mails, respondé este mensaje y te sacamos de la lista.\n\n"
        . "Studio Complex\n" . SC_SITIO,
        'hola@studiocomplex.com.ar',
        'Studio Complex'
    );
    $mailSent = true;
} catch (Exception $e) {
    error_log('recurso-form.php mail error: ' . $e->getMessage());
}

// Aviso interno. Si falla, no cambia la respuesta.
try {
    sc_send_smtp_mail(
        'hola@studiocomplex.com.ar',
        'Nueva descarga: ' . $datos['titulo'],
        "Nombre: {$nombre}\nEmail: {$email}\nRecurso: {$recurso}\nNota de origen: " . ($nota ?: '(directo)')
        . "\nCRM: " . ($crmSent ? 'sí' : 'no') . " · Brevo: " . ($brevoSent ? 'sí' : 'no')
        . ($campana ? "\nCampaña: " . json_encode($campana, JSON_UNESCAPED_UNICODE) : '')
    );
} catch (Exception $e) {
    error_log('recurso-form.php aviso error: ' . $e->getMessage());
}

if (!$crmSent && !$mailSent && !$brevoSent) {
    respond('error', 'No pudimos procesar el pedido. Probá de nuevo en unos minutos o escribinos por WhatsApp.');
}

respond('success', '¡Listo! Te mandamos el link a tu mail. También podés descargarlo ahora.', ['descarga' => $datos['archivo']]);
