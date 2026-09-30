<?php
// Sends newsletter signups (footer form) via SMTP2GO to hola@studiocomplex.com.ar.
require __DIR__ . '/smtp-mailer.php';
require __DIR__ . '/recaptcha-verify.php';

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

try {
    sc_send_smtp_mail(
        'hola@studiocomplex.com.ar',
        'Nueva suscripción al newsletter',
        "Nuevo suscriptor: {$email}"
    );

    respond('success', '¡Listo! Te suscribiste correctamente.');
} catch (Exception $e) {
    error_log('newsletter-form.php mail error: ' . $e->getMessage());
    respond('error', 'No se pudo procesar la suscripción. Intentá nuevamente.');
}
