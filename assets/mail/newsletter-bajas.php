<?php
// Newsletter unsubscribe helpers, shared by newsletter-form.php and newsletter-baja.php.
//
// - Each confirmation mail carries a personal link:
//     https://studiocomplex.com.ar/assets/mail/newsletter-baja.php?e=<email>&t=<token>
//   The token is an HMAC of the email, so nobody can unsubscribe someone else.
// - The signing key is derived from the CRM secret in crm-config.php (server only),
//   so no new secret has to be created. Without that file the link is not offered.
// - Unsubscribed emails are kept in sc-newsletter-bajas.json, OUTSIDE public_html
//   (same folder as sc-intake-fallback.jsonl). Subscribing again removes the email.

function sc_baja_clave() {
    $configFile = __DIR__ . '/crm-config.php';
    if (!is_file($configFile)) {
        return '';
    }
    $config = require $configFile;
    $secret = is_array($config) ? trim((string) ($config['secret'] ?? '')) : '';
    return $secret === '' ? '' : hash('sha256', 'sc-newsletter-baja|' . $secret);
}

function sc_baja_normalizar($email) {
    return strtolower(trim((string) $email));
}

function sc_baja_token($email) {
    $clave = sc_baja_clave();
    if ($clave === '') {
        return '';
    }
    return substr(hash_hmac('sha256', sc_baja_normalizar($email), $clave), 0, 32);
}

function sc_baja_token_valido($email, $token) {
    $esperado = sc_baja_token($email);
    return $esperado !== '' && is_string($token) && hash_equals($esperado, $token);
}

function sc_baja_link($email) {
    $token = sc_baja_token($email);
    if ($token === '') {
        return '';
    }
    return 'https://studiocomplex.com.ar/assets/mail/newsletter-baja.php?e='
        . rawurlencode(sc_baja_normalizar($email)) . '&t=' . $token;
}

function sc_baja_archivo() {
    return dirname(__DIR__, 3) . '/sc-newsletter-bajas.json';
}

// Reads, changes and writes the list under one lock. $cambio receives and returns the array.
function sc_baja_editar(callable $cambio) {
    $fh = @fopen(sc_baja_archivo(), 'c+');
    if (!$fh) {
        error_log('newsletter-bajas.php: list file not writable');
        return false;
    }
    flock($fh, LOCK_EX);
    $actual = json_decode((string) stream_get_contents($fh), true);
    $nuevo  = $cambio(is_array($actual) ? $actual : []);
    ftruncate($fh, 0);
    rewind($fh);
    fwrite($fh, json_encode($nuevo, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
    fflush($fh);
    flock($fh, LOCK_UN);
    fclose($fh);
    return true;
}

function sc_baja_agregar($email) {
    $email = sc_baja_normalizar($email);
    return sc_baja_editar(function ($lista) use ($email) {
        $lista[$email] = date('c');
        return $lista;
    });
}

function sc_baja_quitar($email) {
    $email = sc_baja_normalizar($email);
    if (!is_file(sc_baja_archivo())) {
        return true;
    }
    return sc_baja_editar(function ($lista) use ($email) {
        unset($lista[$email]);
        return $lista;
    });
}

function sc_baja_esta_dado_de_baja($email) {
    $lista = is_file(sc_baja_archivo()) ? json_decode((string) @file_get_contents(sc_baja_archivo()), true) : [];
    return is_array($lista) && isset($lista[sc_baja_normalizar($email)]);
}
