<?php
// Single public receiver for everything on the site that is not the contact/newsletter forms:
//   tipo "form"       -> modal "Contanos tu caso" and domain-search form: the person left their data,
//                        so it becomes a lead in the sales CRM (same path as contact-form.php) and a mail to hola@.
//   tipo "interaccion"-> anonymous click on WhatsApp / agenda / phone / mail: nobody left data, so it is only
//                        counted in the client panel (Solicitudes web > Interacciones). No cookies, no IP stored.
// The shared secrets live in assets/mail/crm-config.php (CRM) and assets/mail/panel-config.php (panel), both
// outside the repo. This file never prints them.

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

function lead_respond(int $status, array $body = []): void
{
    http_response_code($status);
    echo $status === 204 ? '' : json_encode($body, JSON_UNESCAPED_UNICODE);
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    lead_respond(405, ['ok' => false]);
}

$raw = file_get_contents('php://input', false, null, 0, 10001);
if ($raw === false || strlen($raw) > 10000) {
    lead_respond(413, ['ok' => false]);
}
$in = json_decode($raw, true);
if (!is_array($in)) {
    lead_respond(400, ['ok' => false]);
}

$tipo = (string) ($in['tipo'] ?? '');
$ua   = (string) ($_SERVER['HTTP_USER_AGENT'] ?? '');
$isBot = $ua === '' || preg_match('/bot|crawl|spider|slurp|headless|curl|python|scrapy|monitor/i', $ua) === 1;

/** Per-visitor hourly limit without storing the IP: a daily-salted hash in a temp file. */
function lead_rate_ok(string $bucket, int $max): bool
{
    $ip   = (string) ($_SERVER['REMOTE_ADDR'] ?? '');
    $key  = md5($ip . '|' . date('Y-m-d') . '|' . __FILE__ . '|' . $bucket);
    $file = sys_get_temp_dir() . '/sc-rl-' . $key;
    $data = is_file($file) ? json_decode((string) @file_get_contents($file), true) : null;
    $now  = time();
    if (!is_array($data) || ($data['t'] ?? 0) < $now - 3600) {
        $data = ['t' => $now, 'n' => 0];
    }
    ++$data['n'];
    @file_put_contents($file, json_encode($data), LOCK_EX);
    return $data['n'] <= $max;
}

function lead_clean(string $v, int $max): string
{
    $v = trim(preg_replace('/\s+/u', ' ', strip_tags($v)));
    return function_exists('mb_substr') ? mb_substr($v, 0, $max) : substr($v, 0, $max);
}

/* ------------------------------------------------------------ anonymous interaction */
if ($tipo === 'interaccion') {
    if ($isBot || !lead_rate_ok('interaccion', 200)) {
        lead_respond(204);
    }
    $canales = ['whatsapp', 'agenda', 'telefono', 'email'];
    $zonas   = ['header', 'footer', 'modal', 'contenido'];
    $canal   = (string) ($in['canal'] ?? '');
    $zona    = (string) ($in['zona'] ?? 'contenido');
    $pagina  = (string) ($in['pagina'] ?? '/');
    if (!in_array($canal, $canales, true) || !preg_match('#^/[a-z0-9\-_/.]{0,120}$#i', $pagina)) {
        lead_respond(400, ['ok' => false]);
    }
    if (!in_array($zona, $zonas, true)) {
        $zona = 'contenido';
    }
    // The prefilled WhatsApp text is our own copy; still, drop anything that looks like a phone number or mail.
    $tema = lead_clean((string) ($in['tema'] ?? ''), 100);
    $tema = preg_replace('/[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+|\d[\d\s().\-]{6,}\d/u', '', $tema);

    $body = json_encode(
        ['canal' => $canal, 'zona' => $zona, 'pagina' => $pagina, 'tema' => trim((string) $tema), 'ts' => time()],
        JSON_UNESCAPED_UNICODE
    );

    $cfgFile = __DIR__ . '/panel-config.php';
    $cfg     = is_file($cfgFile) ? include $cfgFile : [];
    $url     = is_array($cfg) ? (string) ($cfg['url'] ?? '') : '';
    $secret  = is_array($cfg) ? (string) ($cfg['secret'] ?? '') : '';
    $sent    = false;
    if ($url !== '' && $secret !== '' && function_exists('curl_init')) {
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_POST           => true,
            CURLOPT_POSTFIELDS     => $body,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT        => 4,
            CURLOPT_HTTPHEADER     => [
                'Content-Type: application/json',
                'X-Ndg-Firma: ' . hash_hmac('sha256', $body, $secret),
            ],
        ]);
        curl_exec($ch);
        $sent = ((int) curl_getinfo($ch, CURLINFO_HTTP_CODE)) >= 200 && ((int) curl_getinfo($ch, CURLINFO_HTTP_CODE)) < 300;
    }
    if (!$sent) {
        // The panel can be down: keep the count outside the web root and move on.
        $fb = dirname(__DIR__, 3) . '/sc-interactions-fallback.jsonl';
        @file_put_contents($fb, $body . "\n", FILE_APPEND | LOCK_EX);
    }
    lead_respond(204);
}

/* ------------------------------------------------------------ form with personal data */
if ($tipo !== 'form') {
    lead_respond(400, ['ok' => false]);
}

// Bots: filled trap field, or sent in under 1.5 seconds. Pretend it worked.
if (lead_clean((string) ($in['web'] ?? ''), 100) !== '' || (isset($in['t']) && (int) $in['t'] < 1500)) {
    lead_respond(200, ['ok' => true]);
}
if (!lead_rate_ok('form', 8)) {
    lead_respond(429, ['ok' => false, 'error' => 'Recibimos varias consultas seguidas. Probá de nuevo en un rato o escribinos por WhatsApp.']);
}

$nombre   = lead_clean((string) ($in['nombre'] ?? ''), 80);
$email    = filter_var(lead_clean((string) ($in['email'] ?? ''), 120), FILTER_VALIDATE_EMAIL) ?: '';
$telefono = lead_clean((string) ($in['whatsapp'] ?? $in['telefono'] ?? ''), 30);
$mensaje  = lead_clean((string) ($in['mensaje'] ?? ''), 1500);
$origen   = lead_clean((string) ($in['origen'] ?? ''), 160);
$pagina   = lead_clean((string) ($in['pagina'] ?? ''), 200);
$form     = in_array($in['form'] ?? '', ['modal', 'buscador'], true) ? $in['form'] : 'web';

if (strlen($nombre) < 2 || $email === '') {
    lead_respond(422, ['ok' => false, 'error' => 'Completá tu nombre y un email válido.']);
}
$digitos = preg_replace('/\D/', '', $telefono);
if ($telefono !== '' && (strlen($digitos) < 8 || strlen($digitos) > 15)) {
    lead_respond(422, ['ok' => false, 'error' => 'Revisá el WhatsApp (con código de área).']);
}

$subject = $form === 'modal' ? 'Contanos tu caso' : 'Buscador de dominios';
$extra   = [];
if ($form === 'buscador') {
    foreach (['dominio' => 'Dominio', 'proyecto' => 'Qué quiere armar', 'motivo' => 'Situación'] as $k => $label) {
        $v = lead_clean((string) ($in[$k] ?? ''), 160);
        if ($v !== '') {
            $extra[] = "{$label}: {$v}";
        }
    }
    if (!empty($in['dominio'])) {
        $subject .= ' · ' . lead_clean((string) $in['dominio'], 80);
    }
}
$fullMessage = trim(implode("\n", $extra) . ($mensaje !== '' ? "\n\n" . $mensaje : '') . ($origen !== '' ? "\n\nVino de: {$origen}" : ''));

require_once __DIR__ . '/crm-lead.php';
$crmSent = sc_send_lead_to_crm([
    'name'         => $nombre,
    'email'        => $email,
    'phone'        => $telefono,
    'subject'      => $subject,
    'message'      => $fullMessage,
    'landing_page' => $pagina,
    'website'      => '',
]);

// The mail to the team is independent of the CRM: if either got the contact, it is not lost.
$mailSent = false;
if (is_file(__DIR__ . '/smtp-mailer.php')) {
    try {
        require_once __DIR__ . '/smtp-mailer.php';
        sc_send_smtp_mail(
            'hola@studiocomplex.com.ar',
            'Nueva consulta web - ' . $subject,
            "Nombre: {$nombre}\nEmail: {$email}\nTeléfono: {$telefono}\nMotivo: {$subject}\n\n" . $fullMessage,
            $email,
            $nombre
        );
        $mailSent = true;
    } catch (Throwable $e) {
        error_log('lead-intake.php mail error: ' . $e->getMessage());
    }
}

if ($crmSent || $mailSent) {
    lead_respond(200, ['ok' => true]);
}
lead_respond(502, ['ok' => false, 'error' => 'No pudimos enviar tu consulta. Probá de nuevo o escribinos por WhatsApp.']);
