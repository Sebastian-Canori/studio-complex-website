<?php
// Saves closer applications in Airtable (base "Reclutamiento Studio Complex").
// Tables: "Postulaciones" (stage 1) and "Perfiles" (stage 2, linked by email).
//
// Credentials live in assets/mail/airtable-config.php, which exists only on the
// server (.gitignore blocks *config*.php; the repo is public). Without that file
// nothing is sent and the forms keep working with mail + CRM only.
// If Airtable does not answer, the record is appended to a file OUTSIDE
// public_html (sc-airtable-fallback.jsonl) so no application is lost. That file
// empties itself: after the next successful create the pending records are sent.
// Nothing is kept when the applicant sees an error (mail, CRM and Airtable all
// failed): they will retry, and keeping it would duplicate the record.

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

function sc_airtable_fallback_file() {
    return dirname(__DIR__, 3) . '/sc-airtable-fallback.jsonl';
}

function sc_airtable_fallback($table, array $fields) {
    $file = sc_airtable_fallback_file();
    // Substitute invalid UTF-8: json_encode would return false and the record would be lost.
    $line = json_encode(['table' => $table, 'fields' => $fields, 'saved_at' => date('c')], JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE) . "\n";
    if (@file_put_contents($file, $line, FILE_APPEND | LOCK_EX) === false) {
        error_log('airtable.php: fallback file not writable');
        return;
    }
    // Personal data: only the account owner reads it.
    @chmod($file, 0600);
}

// Sends back records saved while Airtable was down. Called after a successful create
// (so Airtable is up) and capped at 3 per call: the applicant is waiting on the form.
function sc_airtable_drain_fallback() {
    $file = sc_airtable_fallback_file();
    clearstatcache(true, $file);
    if (!is_file($file) || filesize($file) === 0) {
        return;
    }
    // One replayer at a time, or the same record would be sent twice.
    $guard = @fopen($file . '.lock', 'c');
    if (!$guard || !flock($guard, LOCK_EX | LOCK_NB)) {
        return;
    }
    $sent   = [];
    $budget = 3;
    foreach (file($file, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) ?: [] as $line) {
        $item = json_decode($line, true);
        if ($budget === 0) {
            break;
        }
        if (!is_array($item) || !isset($item['table'], $item['fields'])) {
            continue;
        }
        $budget--;
        // A profile saved without its application (Airtable was down at stage 1): link it now.
        if ($item['table'] === 'Perfiles' && !empty($item['fields']['Sin postulación previa'])) {
            $postulacionId = sc_airtable_find_postulacion($item['fields']['Email'] ?? '');
            if ($postulacionId !== null) {
                unset($item['fields']['Sin postulación previa']);
                $item['fields']['Postulación'] = [$postulacionId];
            }
        }
        $result = sc_airtable_request('POST', rawurlencode($item['table']), [
            'fields'   => $item['fields'],
            'typecast' => true,
        ]);
        if (empty($result['id'])) {
            break; // Airtable is failing again: keep the rest for the next time.
        }
        $sent[] = $line;
    }
    if ($sent) {
        // Re-read under the file lock: other requests may have appended meanwhile.
        $fh = @fopen($file, 'c+');
        if ($fh && flock($fh, LOCK_EX)) {
            $current = array_filter(explode("\n", (string) stream_get_contents($fh)), 'strlen');
            foreach ($sent as $line) {
                $i = array_search($line, $current, true);
                if ($i !== false) {
                    unset($current[$i]);
                }
            }
            ftruncate($fh, 0);
            rewind($fh);
            fwrite($fh, $current ? implode("\n", $current) . "\n" : '');
            fflush($fh);
            flock($fh, LOCK_UN);
        }
        if ($fh) {
            fclose($fh);
        }
    }
    flock($guard, LOCK_UN);
    fclose($guard);
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
// Returns the new record id, or false. On failure the record goes to the fallback
// file only if $keepOnFailure (the applicant got a success through mail or CRM).
function sc_airtable_create($table, array $fields, $keepOnFailure = true) {
    if (sc_airtable_config() === null) {
        return false;
    }
    $result = sc_airtable_request('POST', rawurlencode($table), [
        'fields'   => $fields,
        'typecast' => true,
    ]);
    if ($result === null || empty($result['id'])) {
        if ($keepOnFailure) {
            sc_airtable_fallback($table, $fields);
        }
        return false;
    }
    sc_airtable_drain_fallback();
    return $result['id'];
}

// Finds the most recent "Postulaciones" record for an email, or null.
function sc_airtable_find_postulacion($email) {
    $email = strtolower(trim($email));
    $formula = "LOWER({Email})='" . str_replace("'", "\\'", $email) . "'";
    $result = sc_airtable_request('GET', 'Postulaciones?maxRecords=1&sort%5B0%5D%5Bfield%5D=Fecha%20de%20env%C3%ADo&sort%5B0%5D%5Bdirection%5D=desc&filterByFormula=' . rawurlencode($formula));
    return $result['records'][0]['id'] ?? null;
}
