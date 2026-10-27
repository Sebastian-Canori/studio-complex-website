<?php
// Closer application, stage 2: full profile form + intro video link.
// Open page: the applicant arrives from the stage 1 legend or from a link we send.
require __DIR__ . '/smtp-mailer.php';
require __DIR__ . '/recaptcha-verify.php';
require __DIR__ . '/crm-lead.php';
require __DIR__ . '/closer-lib.php';
require __DIR__ . '/airtable.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sc_closer_respond('error', 'Método no permitido.');
}

$email = sc_closer_clean($_POST['clEmail'] ?? '', 160);

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    sc_closer_respond('error', 'Revisá el email: tiene que ser el mismo de tu postulación.');
}

// field => [label, required, max length]
$fields = [
    'clDia'      => ['Día típico', true, 2000],
    'clPerfil'   => ['Cómo se define como persona y profesional', true, 2000],
    'clExp'      => ['Experiencia comercial (dónde, qué vendía, a quién, resultados)', true, 3000],
    'clRecom'    => ['3 recomendaciones para Studio Complex', true, 3000],
    'clLibros'   => ['Libros recientes', true, 2000],
    'clCursos'   => ['Cursos y capacitaciones', true, 2000],
    'clCursoTop' => ['Capacitación con mayor resultado', true, 2000],
    'clMotiv'    => ['Por qué le interesa Studio Complex', true, 2000],
    'clLargo'    => ['Motivación a largo plazo', true, 2000],
    'clOcup'     => ['Ocupación actual', true, 300],
    'clIngreso'  => ['Ingreso mensual actual (USD, aprox.)', false, 100],
    'clExito'    => ['Éxito personal o profesional', true, 2000],
    'clVideo'    => ['Video de presentación', true, 500],
];

$answers = [];
foreach ($fields as $key => $def) {
    $answers[$key] = sc_closer_clean($_POST[$key] ?? '', $def[2]);
    if ($def[1] && $answers[$key] === '') {
        sc_closer_respond('error', 'Completá todas las preguntas obligatorias.');
    }
}

// Only http(s) links: the value ends up in a mail and in the CRM.
$video = $answers['clVideo'];
if (!preg_match('~^https?://[^\s]+$~i', $video) || !filter_var($video, FILTER_VALIDATE_URL)) {
    sc_closer_respond('error', 'Pegá el link completo del video (que empiece con https://).');
}
if (($_POST['clVerdad'] ?? '') !== '1') {
    sc_closer_respond('error', 'Confirmá que la información que completaste es verdadera.');
}
if (!sc_verify_recaptcha($_POST['recaptcha_token'] ?? '', 'closers_perfil')) {
    sc_closer_respond('error', 'No pudimos validar el formulario. Recargá la página e intentá de nuevo.');
}

$body = "Postulación de closer (etapa 2: perfil y video)\n\nEmail: {$email}\n";
foreach ($fields as $key => $def) {
    $body .= "\n{$def[0]}:\n" . ($answers[$key] !== '' ? $answers[$key] : '-') . "\n";
}

$mailSent = false;
try {
    sc_send_smtp_mail('hola@studiocomplex.com.ar', 'Perfil de closer - ' . $email, $body, $email, $email);
    $mailSent = true;
} catch (Exception $e) {
    error_log('closer-perfil.php mail error: ' . $e->getMessage());
}

$crmSent = sc_send_lead_to_crm([
    'name'    => $email,
    'email'   => $email,
    'phone'   => '',
    'subject' => 'Closer - perfil y video recibidos',
    'message' => "Video: {$video}\n\n" . $body,
    'website' => '',
]);

// Airtable copy, linked to the stage 1 record by email (created anyway if there is none).
$postulacionId = sc_airtable_find_postulacion($email);
$airtableFields = [
    'Email'                   => strtolower($email),
    'Día típico'              => $answers['clDia'],
    'Cómo se define'          => $answers['clPerfil'],
    'Experiencia comercial'   => $answers['clExp'],
    'Recomendaciones'         => $answers['clRecom'],
    'Libros'                  => $answers['clLibros'],
    'Cursos'                  => $answers['clCursos'],
    'Curso con más resultado' => $answers['clCursoTop'],
    'Motivación'              => $answers['clMotiv'],
    'Motivación a largo plazo' => $answers['clLargo'],
    'Ocupación'               => $answers['clOcup'],
    'Ingreso actual (USD)'    => $answers['clIngreso'],
    'Éxito'                   => $answers['clExito'],
    'Video'                   => $video,
    'Fecha de envío'          => gmdate('c'),
];
if ($postulacionId !== null) {
    $airtableFields['Postulación'] = [$postulacionId];
} else {
    $airtableFields['Sin postulación previa'] = true;
}
$airtableSaved = sc_airtable_create('Perfiles', $airtableFields);

if ($mailSent || $crmSent || $airtableSaved) {
    sc_closer_respond('success', '¡Recibimos tu perfil! Lo revisamos y te respondemos por mail.');
}
sc_closer_respond('error', 'No se pudo enviar. Intentá nuevamente en unos minutos.');
