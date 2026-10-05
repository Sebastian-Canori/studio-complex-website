<?php
// Sends the site contact forms (#contact-form and #contact-form-2) via SMTP2GO and
// files the contact in the CRM as a prospect (see crm-lead.php).
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

$SUBJECT_LABELS = [
    '1' => 'Desarrollo Web',
    '2' => 'Tiendas Online',
    '3' => 'SEO Técnico',
    '4' => 'Campañas de Ads',
    '5' => 'Automatización de Leads',
    '6' => 'Cierre de Ventas Automatizado',
];

$name    = trim($_POST['cfName'] ?? $_POST['cfName2'] ?? '');
$email   = trim($_POST['cfEmail'] ?? $_POST['cfEmail2'] ?? '');
$phone   = trim($_POST['cfPhone'] ?? $_POST['cfPhone2'] ?? '');
$subject = trim($_POST['cfSubject'] ?? $_POST['cfSubject2'] ?? '');
$message = trim($_POST['cfMessage'] ?? $_POST['cfMessage2'] ?? '');

if ($name === '' || $email === '' || $phone === '' || $subject === '') {
    respond('error', 'Completá todos los campos obligatorios.');
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    respond('error', 'El email ingresado no es válido.');
}

if (!sc_verify_recaptcha($_POST['recaptcha_token'] ?? '', 'contact')) {
    respond('error', 'No pudimos validar el formulario. Recargá la página e intentá de nuevo.');
}

$subjectLabel = $SUBJECT_LABELS[$subject] ?? 'Consulta general';

// Campaign the visit came from (utm_*, gclid, fbclid, landing page): sent by
// contact-form.js, empty when the person arrived directly.
$attribution = [];
foreach (['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'gclid', 'fbclid', 'landing_page'] as $key) {
    $attribution[$key] = substr(trim((string) ($_POST[$key] ?? '')), 0, 300);
}

$mailSent = false;
try {
    $body = "Nombre: {$name}\n"
          . "Email: {$email}\n"
          . "Teléfono: {$phone}\n"
          . "Motivo: {$subjectLabel}\n\n"
          . "Mensaje:\n{$message}";

    sc_send_smtp_mail(
        'hola@studiocomplex.com.ar',
        'Nueva consulta web - ' . $subjectLabel,
        $body,
        $email,
        $name
    );
    $mailSent = true;
} catch (Exception $e) {
    error_log('contact-form.php mail error: ' . $e->getMessage());
}

// The CRM is independent of the mail: if either one got the contact, it is not lost.
$crmSent = sc_send_lead_to_crm(array_merge($attribution, [
    'name'    => $name,
    'email'   => $email,
    'phone'   => $phone,
    'message' => 'Motivo: ' . $subjectLabel . ($message !== '' ? "\n\n" . $message : ''),
    'website' => '',
]));

if ($mailSent || $crmSent) {
    respond('success', '¡Gracias! Te vamos a contactar a la brevedad.');
}
respond('error', 'No se pudo enviar el mensaje. Intentá nuevamente en unos minutos.');
