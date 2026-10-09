<?php
// Sends newsletter signups (footer form) via SMTP2GO to hola@studiocomplex.com.ar.
require __DIR__ . '/smtp-mailer.php';
require __DIR__ . '/recaptcha-verify.php';
require __DIR__ . '/crm-lead.php';

header('Content-Type: application/json; charset=utf-8');

function respond($status, $message) {
    echo json_encode(['status' => $status, 'message' => $message]);
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
    sc_send_smtp_mail(
        'hola@studiocomplex.com.ar',
        'Nueva suscripción al newsletter',
        "Nuevo suscriptor: {$email}"
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

// Thank-you mail to the subscriber. A failure here never changes the answer.
try {
    sc_send_smtp_mail(
        $email,
        'Gracias por suscribirte a Studio Complex',
        "¡Hola!\n\nGracias por suscribirte al newsletter de Studio Complex. "
        . "Vas a recibir novedades sobre desarrollo web, tiendas online, SEO y publicidad.\n\n"
        . "Si no pediste esta suscripción o querés darte de baja, respondé este mail "
        . "y te sacamos de la lista.\n\nStudio Complex\nhttps://studiocomplex.com.ar",
        'hola@studiocomplex.com.ar',
        'Studio Complex'
    );
} catch (Exception $e) {
    error_log('newsletter-form.php thank-you mail error: ' . $e->getMessage());
}

respond('success', '¡Listo! Te suscribiste correctamente.');
