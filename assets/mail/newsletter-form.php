<?php
// Newsletter signups (footer form):
//   1. Notice to hola@studiocomplex.com.ar.
//   2. Subscriber saved in the CRM (Newsletter group).
//   3. Confirmation mail to the subscriber with a "Darme de baja" button (newsletter-baja.php).
// All mails go through sc-mail.php (SMTP2GO, or the hosting's mail server when it fails).
require __DIR__ . '/sc-mail.php';
require __DIR__ . '/recaptcha-verify.php';
require __DIR__ . '/crm-lead.php';
require __DIR__ . '/newsletter-bajas.php';

header('Content-Type: application/json; charset=utf-8');

function respond($status, $message) {
    echo json_encode(['status' => $status, 'message' => $message], JSON_UNESCAPED_UNICODE);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond('error', 'Método no permitido.');
}

$email = trim($_POST['email'] ?? '');

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    respond('error', 'Ingresá un email válido.');
}

if (!sc_verify_recaptcha($_POST['recaptcha_token'] ?? '', 'newsletter')) {
    respond('error', 'No pudimos validar la suscripción. Recargá la página e intentá de nuevo.');
}

$mailSent = false;
try {
    sc_enviar_mail(
        'hola@studiocomplex.com.ar',
        'Nueva suscripción al newsletter',
        "Nuevo suscriptor: {$email}\nFecha: " . date('d/m/Y H:i')
    );
    $mailSent = true;
} catch (Exception $e) {
    error_log('newsletter-form.php mail error: ' . $e->getMessage());
}

// The CRM is independent of the mail: if either one got the signup, it is not lost.
$crmSent = sc_send_to_crm('newsletter', [
    'email'   => $email,
    'consent' => true,
    'source'  => 'Web - newsletter (pie)',
]);

if (!$mailSent && !$crmSent) {
    respond('error', 'No se pudo procesar la suscripción. Intentá nuevamente.');
}

// Subscribing again after an unsubscribe takes the email off the unsubscribe list.
sc_baja_quitar($email);

// Confirmation mail to the subscriber. A failure here never changes the answer.
$baja  = sc_baja_link($email);
$texto = "¡Hola!\n\n"
       . "Te suscribiste al newsletter de Studio Complex. Gracias por confiar en nuestras novedades: "
       . "te vamos a escribir sobre desarrollo web, tiendas online, SEO y publicidad.\n\n"
       . ($baja !== ''
           ? "Si querés desuscribirte, podés hacerlo desde acá: {$baja}\n\n"
           : "Si querés desuscribirte, respondé este mail y te sacamos de la lista.\n\n")
       . "Studio Complex\nhttps://studiocomplex.com.ar";

$botonBaja = $baja === '' ? '' :
    '<tr><td style="padding:8px 32px 32px;">'
    . '<p style="margin:0 0 14px;font-size:15px;line-height:1.55;color:#3b4150;">Si querés desuscribirte, podés hacerlo desde acá:</p>'
    . '<a href="' . htmlspecialchars($baja, ENT_QUOTES, 'UTF-8') . '" '
    . 'style="display:inline-block;padding:12px 24px;border-radius:999px;background:#0b0e14;color:#ffffff;'
    . 'font-size:15px;font-weight:600;text-decoration:none;">Desuscribirme</a>'
    . '</td></tr>';

$html = '<!doctype html><html lang="es"><head><meta charset="utf-8">'
      . '<meta name="viewport" content="width=device-width,initial-scale=1"></head>'
      . '<body style="margin:0;padding:0;background:#f4f5f7;">'
      . '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f5f7;padding:24px 12px;">'
      . '<tr><td align="center">'
      . '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" '
      . 'style="max-width:560px;background:#ffffff;border-radius:16px;font-family:Arial,Helvetica,sans-serif;color:#0b0e14;">'
      . '<tr><td style="padding:32px 32px 8px;font-size:16px;font-weight:700;letter-spacing:.02em;">Studio Complex</td></tr>'
      . '<tr><td style="padding:8px 32px 0;">'
      . '<h1 style="margin:0 0 14px;font-size:22px;line-height:1.3;">¡Te suscribiste al newsletter!</h1>'
      . '<p style="margin:0 0 18px;font-size:15px;line-height:1.55;color:#3b4150;">Gracias por confiar en nuestras novedades. '
      . 'Te vamos a escribir sobre desarrollo web, tiendas online, SEO y publicidad.</p>'
      . '</td></tr>'
      . $botonBaja
      . '</table>'
      . '<p style="margin:16px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#6b7280;">'
      . 'Studio Complex · <a href="https://studiocomplex.com.ar" style="color:#6b7280;">studiocomplex.com.ar</a></p>'
      . '</td></tr></table></body></html>';

$cabeceras = [];
if ($baja !== '') {
    // Lets Gmail and other mail apps show their own "Unsubscribe" link (one click, RFC 8058).
    $cabeceras['List-Unsubscribe']      = '<' . $baja . '>';
    $cabeceras['List-Unsubscribe-Post'] = 'List-Unsubscribe=One-Click';
}

try {
    sc_enviar_mail($email, 'Te suscribiste al newsletter de Studio Complex', $texto, [
        'html'       => $html,
        'headers'    => $cabeceras,
        'reply_to'   => 'hola@studiocomplex.com.ar',
        'reply_name' => 'Studio Complex',
    ]);
} catch (Exception $e) {
    error_log('newsletter-form.php confirmation mail error: ' . $e->getMessage());
}

respond('success', '¡Gracias por suscribirte! Te mandamos un mail de confirmación.');
