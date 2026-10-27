<?php
// Closer application, stage 1: personal data and sales background.
// Mails hola@ (with the ready-to-forward stage 2 link) and files the lead in the CRM.
require __DIR__ . '/smtp-mailer.php';
require __DIR__ . '/recaptcha-verify.php';
require __DIR__ . '/crm-lead.php';
require __DIR__ . '/closer-lib.php';
require __DIR__ . '/airtable.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sc_closer_respond('error', 'Método no permitido.');
}

// Honeypot: real people leave it empty.
if (trim($_POST['website'] ?? '') !== '') {
    sc_closer_respond('success', '¡Gracias! Revisamos tu postulación.');
}

$name       = sc_closer_clean($_POST['clName'] ?? '', 120);
$email      = sc_closer_clean($_POST['clEmail'] ?? '', 160);
$phone      = sc_closer_clean($_POST['clPhone'] ?? '', 40);
$location   = sc_closer_clean($_POST['clLocation'] ?? '', 120);
$experience = sc_closer_clean($_POST['clExperience'] ?? '', 40);
$sold       = sc_closer_clean($_POST['clSold'] ?? '', 1500);
$availability = sc_closer_clean($_POST['clAvailability'] ?? '', 60);
$b2b        = sc_closer_clean($_POST['clB2b'] ?? '', 60);
$profile    = sc_closer_clean($_POST['clProfile'] ?? '', 300);
$consent    = ($_POST['clConsent'] ?? '') === '1';

if ($name === '' || $email === '' || $phone === '' || $location === '' || $experience === '' || $sold === '' || $availability === '' || $b2b === '') {
    sc_closer_respond('error', 'Completá todos los campos obligatorios.');
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    sc_closer_respond('error', 'El email ingresado no es válido.');
}
if (!$consent) {
    sc_closer_respond('error', 'Necesitamos tu consentimiento para usar tus datos.');
}
if (!sc_verify_recaptcha($_POST['recaptcha_token'] ?? '', 'closers')) {
    sc_closer_respond('error', 'No pudimos validar el formulario. Recargá la página e intentá de nuevo.');
}

$stage2    = sc_closer_stage2_url($email);
$qualifies = sc_closer_qualifies($experience, $b2b);

$body = "Postulación de closer (etapa 1)\n\n"
      . "Nombre: {$name}\n"
      . "Email: {$email}\n"
      . "WhatsApp: {$phone}\n"
      . "Ciudad / país: {$location}\n"
      . "Experiencia en ventas: {$experience}\n"
      . "Disponibilidad: {$availability}\n"
      . "Vendió a dueños de pymes: {$b2b}\n"
      . "Perfil (LinkedIn u otro): " . ($profile !== '' ? $profile : '-') . "\n\n"
      . "Qué vendió y cómo:\n{$sold}\n\n"
      . ($qualifies
          ? "Cumple el corte (1 año o más y vendió a pymes): vio la invitación para completar la etapa 2.\n"
          : "No cumple el corte automático. Si lo querés invitar a la etapa 2 (perfil y video), mandale este link:\n{$stage2}\n");

$mailSent = false;
try {
    sc_send_smtp_mail('hola@studiocomplex.com.ar', 'Postulación closer - ' . $name, $body, $email, $name);
    $mailSent = true;
} catch (Exception $e) {
    error_log('closer-form.php mail error: ' . $e->getMessage());
}

$crmSent = sc_send_lead_to_crm([
    'name'    => $name,
    'email'   => $email,
    'phone'   => $phone,
    'subject' => 'Postulación closer',
    'message' => "Experiencia: {$experience}. Disponibilidad: {$availability}. Vendió a pymes: {$b2b}. Ubicación: {$location}. Perfil: {$profile}.\nQué vendió: {$sold}",
    'website' => '',
]);

// Airtable is one more copy of the application: it never blocks the answer.
$airtableSaved = sc_airtable_create('Postulaciones', [
    'Email'                => strtolower($email),
    'Nombre'               => $name,
    'WhatsApp'             => $phone,
    'Ciudad y país'        => $location,
    'Perfil'               => $profile,
    'Años cerrando ventas' => $experience,
    'Disponibilidad'       => $availability,
    'Vendió a pymes'       => $b2b,
    'Experiencia'          => $sold,
    'Pasa corte'           => $qualifies,
    'Estado'               => 'Nuevo',
    'Fecha de envío'       => gmdate('c'),
], $mailSent || $crmSent);

if ($mailSent || $crmSent || $airtableSaved) {
    sc_closer_respond('success', $qualifies
        ? '¡Gracias! Recibimos tu postulación.'
        : '¡Gracias! Revisamos tu postulación y, si avanza, te mandamos el paso siguiente por mail.');
}
sc_closer_respond('error', 'No se pudo enviar la postulación. Intentá nuevamente en unos minutos.');
