<?php
// Saves closer applications in Airtable (base "Reclutamiento Studio Complex").
// Tables: "Postulaciones" (stage 1) and "Perfiles" (stage 2, linked by email).
//
// Credentials live in assets/mail/airtable-config.php, which exists only on the
// server (.gitignore blocks *config*.php; the repo is public). Without that file
// nothing is sent and the forms keep working with mail + CRM only.
// If Airtable does not answer, the record is appended to a file OUTSIDE
// public_html (sc-airtable-fallback.jsonl) so no application is lost.

function sc_airtable_config() {
    $file = __DIR__ . '/airtable-config.php';
    if (!is_file($file)) {
        return null;
    }
    $config = require $file;
    if (!is_array($config) || trim($config['token'] ?? '') === '' || trim($config['base'] ?? '') === '') {
        return null;
    }
    $config['api'] = rtrim($config['api'] ?? 'https://api.airtable.com', '/');
    return $config;
}

function sc_airtable_fallback($table, array $fields) {
    $file = dirname(__DIR__, 3) . '/sc-airtable-fallback.jsonl';
    $line = json_encode(['table' => $table, 'fields' => $fields, 'saved_at' => date('c')], JSON_UNESCAPED_UNICODE) . "\n";
    if (@file_put_contents($file, $line, FILE_APPEND | LOCK_EX) === false) {
        error_log('airtable.php: fallback file not writable');
    }
}

// Returns the decoded JSON body on success, null on failure.
function sc_airtable_request($method, $path, $body = null) {
    $config = sc_airtable_config();
    if ($config === null || !function_exists('curl_init')) {
        return null;
    }
    $ch = curl_init($config['api'] . '/v0/' . $config['base'] . '/' . $path);
    $opts = [
        CURLOPT_CUSTOMREQUEST  => $method,
        CURLOPT_RETURNTRANSFER => true,
        // Short timeouts: the applicant is waiting on the form.
        CURLOPT_CONNECTTIMEOUT => 3,
        CURLOPT_TIMEOUT        => 6,
        CURLOPT_HTTPHEADER     => [
            'Authorization: Bearer ' . $config['token'],
            'Content-Type: application/json',
        ],
    ];
    if ($body !== null) {
        $opts[CURLOPT_POSTFIELDS] = json_encode($body, JSON_UNESCAPED_UNICODE);
    }
    curl_setopt_array($ch, $opts);
    $response = curl_exec($ch);
    $status   = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error    = curl_error($ch);
    if ($response === false || $status < 200 || $status >= 300) {
        error_log('airtable.php: HTTP ' . $status . ' ' . $error);
        return null;
    }
    $decoded = json_decode($response, true);
    return is_array($decoded) ? $decoded : null;
}

// Creates one record. typecast lets Airtable accept new select options.
// Returns the new record id, or false (the record then goes to the fallback file).
function sc_airtable_create($table, array $fields) {
    if (sc_airtable_config() === null) {
        return false;
    }
    $result = sc_airtable_request('POST', rawurlencode($table), [
        'fields'   => $fields,
        'typecast' => true,
    ]);
    if ($result === null || empty($result['id'])) {
        sc_airtable_fallback($table, $fields);
        return false;
    }
    return $result['id'];
}

// Finds the most recent "Postulaciones" record for an email, or null.
function sc_airtable_find_postulacion($email) {
    $email = strtolower(trim($email));
    $formula = "LOWER({Email})='" . str_replace("'", "\\'", $email) . "'";
    $result = sc_airtable_request('GET', 'Postulaciones?maxRecords=1&sort%5B0%5D%5Bfield%5D=Fecha%20de%20env%C3%ADo&sort%5B0%5D%5Bdirection%5D=desc&filterByFormula=' . rawurlencode($formula));
    return $result['records'][0]['id'] ?? null;
}
