<?php
// Single entry point for every mail the site sends.
//
// sc_enviar_mail($to, $subject, $text, $opts) throws Exception when the mail could not be sent.
//   $opts: 'reply_to', 'reply_name', 'html' (HTML version of the same mail), 'headers' (extra headers).
//
// Route:
//   1. Text-only mails try SMTP2GO first (smtp-mailer.php, server only), as before.
//   2. If SMTP2GO fails, or the mail has an HTML version (the mailer only sends plain text),
//      it goes out through the hosting's own mail server with PHP mail(), from
//      no-reply@studiocomplex.com.ar. The domain's SPF and DKIM (default._domainkey) cover it.
//
// Why: on 26/11/2026 SMTP2GO started rejecting every mail ("550 that smtp username's account
// is not allowed to send") and contacts only reached the CRM. With this fallback a problem in
// SMTP2GO no longer leaves hola@ without the notice.

const SC_MAIL_FROM      = 'no-reply@studiocomplex.com.ar';
const SC_MAIL_FROM_NAME = 'Studio Complex';

if (is_file(__DIR__ . '/smtp-mailer.php')) {
    require_once __DIR__ . '/smtp-mailer.php';
}

function sc_mail_linea($valor) {
    return trim(preg_replace('/[\r\n]+/', ' ', (string) $valor));
}

function sc_mail_encabezado($texto) {
    $texto = sc_mail_linea($texto);
    return preg_match('/[^\x20-\x7E]/', $texto) ? '=?UTF-8?B?' . base64_encode($texto) . '?=' : $texto;
}

function sc_mail_direccion($email, $nombre = '') {
    $email = sc_mail_linea($email);
    $nombre = sc_mail_linea($nombre);
    return $nombre === '' ? $email : sc_mail_encabezado($nombre) . ' <' . $email . '>';
}

// Sends through the hosting's mail server (exim) with PHP mail().
function sc_mail_local($to, $subject, $text, array $opts = []) {
    if (!function_exists('mail')) {
        throw new Exception('mail() no está disponible en el servidor');
    }
    $to = sc_mail_linea($to);
    if (!filter_var($to, FILTER_VALIDATE_EMAIL)) {
        throw new Exception('Destinatario inválido');
    }

    $headers = [
        'From: ' . sc_mail_direccion(SC_MAIL_FROM, SC_MAIL_FROM_NAME),
        'MIME-Version: 1.0',
        'X-Mailer: studiocomplex.com.ar',
    ];
    $replyTo = $opts['reply_to'] ?? '';
    if ($replyTo !== '' && filter_var(sc_mail_linea($replyTo), FILTER_VALIDATE_EMAIL)) {
        $headers[] = 'Reply-To: ' . sc_mail_direccion($replyTo, $opts['reply_name'] ?? '');
    }
    foreach (($opts['headers'] ?? []) as $nombre => $valor) {
        $headers[] = sc_mail_linea($nombre) . ': ' . sc_mail_linea($valor);
    }

    $html = (string) ($opts['html'] ?? '');
    if ($html === '') {
        $headers[] = 'Content-Type: text/plain; charset=UTF-8';
        $headers[] = 'Content-Transfer-Encoding: base64';
        $body = chunk_split(base64_encode($text));
    } else {
        $limite = 'sc-' . bin2hex(random_bytes(12));
        $headers[] = 'Content-Type: multipart/alternative; boundary="' . $limite . '"';
        $body = "--{$limite}\r\n"
              . "Content-Type: text/plain; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n"
              . chunk_split(base64_encode($text))
              . "--{$limite}\r\n"
              . "Content-Type: text/html; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n"
              . chunk_split(base64_encode($html))
              . "--{$limite}--\r\n";
    }

    // -f sets the envelope sender, so bounces and SPF use the domain and not the server.
    if (!@mail($to, sc_mail_encabezado($subject), $body, implode("\r\n", $headers), '-f' . SC_MAIL_FROM)) {
        throw new Exception('El servidor de correo local no aceptó el mail');
    }
}

function sc_enviar_mail($to, $subject, $text, array $opts = []) {
    $html = (string) ($opts['html'] ?? '');
    if ($html === '' && empty($opts['headers']) && function_exists('sc_send_smtp_mail')) {
        try {
            sc_send_smtp_mail($to, $subject, $text, $opts['reply_to'] ?? null, $opts['reply_name'] ?? null);
            return 'smtp2go';
        } catch (Throwable $e) {
            error_log('sc-mail.php: SMTP2GO falló, se envía por el servidor local: ' . $e->getMessage());
        }
    }
    sc_mail_local($to, $subject, $text, $opts);
    return 'local';
}
