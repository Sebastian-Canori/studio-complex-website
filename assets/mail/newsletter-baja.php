<?php
// Newsletter unsubscribe page (the "Darme de baja" button of each mail).
//
// GET  ?e=<email>&t=<token>  -> asks to confirm (mail scanners open links on their
//                               own; a GET alone must never unsubscribe anyone).
// POST e, t                  -> unsubscribes: list outside public_html, CRM (best
//                               effort) and a notice to hola@.
// Also accepts the one-click POST of mail apps (List-Unsubscribe-Post, RFC 8058).
require __DIR__ . '/sc-mail.php';
require __DIR__ . '/crm-lead.php';
require __DIR__ . '/newsletter-bajas.php';

header('Content-Type: text/html; charset=utf-8');
header('X-Robots-Tag: noindex, nofollow');
header('Cache-Control: no-store');

$esPost = ($_SERVER['REQUEST_METHOD'] ?? '') === 'POST';
$email  = sc_baja_normalizar($esPost ? ($_POST['e'] ?? $_GET['e'] ?? '') : ($_GET['e'] ?? ''));
$token  = (string) ($esPost ? ($_POST['t'] ?? $_GET['t'] ?? '') : ($_GET['t'] ?? ''));
$valido = filter_var($email, FILTER_VALIDATE_EMAIL) && sc_baja_token_valido($email, $token);

$estado = 'invalido';
if ($valido && !$esPost) {
    $estado = sc_baja_esta_dado_de_baja($email) ? 'hecho' : 'confirmar';
} elseif ($valido && $esPost) {
    $yaEstaba = sc_baja_esta_dado_de_baja($email);
    if (sc_baja_agregar($email)) {
        $estado = 'hecho';
        if (!$yaEstaba) {
            // CRM: only works once its intake knows the "unsubscribe" type; failing is fine,
            // the list above is the source of truth and hola@ gets the notice below.
            sc_send_to_crm('unsubscribe', ['email' => $email, 'source' => 'Web - baja del newsletter'], false);
            try {
                sc_enviar_mail(
                    'hola@studiocomplex.com.ar',
                    'Baja del newsletter',
                    "Se dio de baja del newsletter: {$email}\nFecha: " . date('d/m/Y H:i')
                    . "\n\nYa no hay que mandarle más novedades."
                );
            } catch (Exception $e) {
                error_log('newsletter-baja.php notice error: ' . $e->getMessage());
            }
        }
    } else {
        $estado = 'error';
    }
}

$h = function ($v) {
    return htmlspecialchars((string) $v, ENT_QUOTES, 'UTF-8');
};

$textos = [
    'confirmar' => ['¿Querés darte de baja?', 'Vas a dejar de recibir el newsletter de Studio Complex en <strong>' . $h($email) . '</strong>.'],
    'hecho'     => ['Listo, te dimos de baja', 'No vas a recibir más el newsletter en <strong>' . $h($email) . '</strong>. Si fue un error, podés volver a suscribirte desde el pie de nuestra web.'],
    'invalido'  => ['El link no es válido', 'Puede que esté incompleto. Probá abrirlo de nuevo desde el mail o escribinos a <a href="mailto:hola@studiocomplex.com.ar">hola@studiocomplex.com.ar</a> y te damos de baja.'],
    'error'     => ['No pudimos darte de baja', 'Algo falló de nuestro lado. Escribinos a <a href="mailto:hola@studiocomplex.com.ar">hola@studiocomplex.com.ar</a> y te damos de baja a mano.'],
];
[$titulo, $texto] = $textos[$estado];
?>
<!doctype html>
<html lang="es-AR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex, nofollow">
  <title><?= $h($titulo) ?> · Studio Complex</title>
  <link rel="icon" href="/favicon.ico">
  <style>
    body { margin: 0; min-height: 100vh; display: flex; align-items: center; justify-content: center;
           background: #f4f5f7; color: #0b0e14; font-family: Figtree, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; }
    .caja { background: #fff; max-width: 460px; width: calc(100% - 32px); padding: 36px 32px; border-radius: 16px;
            box-shadow: 0 10px 40px rgba(11, 14, 20, .08); text-align: center; box-sizing: border-box; }
    .marca { font-weight: 700; letter-spacing: .02em; margin-bottom: 24px; }
    h1 { font-size: 24px; margin: 0 0 12px; }
    p { font-size: 16px; line-height: 1.55; margin: 0 0 24px; color: #3b4150; }
    a { color: #0b0e14; }
    button, .boton { display: inline-block; border: 0; border-radius: 999px; padding: 13px 26px; font: inherit;
                     font-weight: 600; cursor: pointer; text-decoration: none; background: #0b0e14; color: #fff; }
    .volver { display: block; margin-top: 18px; font-size: 14px; }
  </style>
</head>
<body>
  <main class="caja">
    <div class="marca">Studio Complex</div>
    <h1><?= $h($titulo) ?></h1>
    <p><?= $texto ?></p>
    <?php if ($estado === 'confirmar') : ?>
      <form method="post" action="newsletter-baja.php">
        <input type="hidden" name="e" value="<?= $h($email) ?>">
        <input type="hidden" name="t" value="<?= $h($token) ?>">
        <button type="submit">Sí, darme de baja</button>
      </form>
      <a class="volver" href="https://studiocomplex.com.ar/">No, quiero seguir recibiendo novedades</a>
    <?php else : ?>
      <a class="boton" href="https://studiocomplex.com.ar/">Ir a studiocomplex.com.ar</a>
    <?php endif; ?>
  </main>
</body>
</html>
