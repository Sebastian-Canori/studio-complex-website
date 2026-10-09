<?php
// Sends website contacts and newsletter signups to the CRM intake endpoint
// (POST <url>, JSON, "Authorization: Bearer <secret>").
//
// Today the endpoint is the WordPress CRM (.../index.php?rest_route=/sc-crm/v1/intake).
// The custom CRM exposes the same contract (/api/integrations/leads), so moving
// over only means changing "url" in crm-config.php.
//
// The CRM address and secret live in assets/mail/crm-config.php, which exists
// only on the server (.gitignore blocks *config*.php; the repo is public):
//
//   <?php return ['url' => 'https://<crm>/...', 'secret' => '<INTAKE_SECRET>'];
//
// Without that file nothing is sent and the forms keep working as mail-only.
// If the CRM does not answer, the record is appended to a file OUTSIDE
// public_html (sc-intake-fallback.jsonl) so no contact is lost.

function sc_crm_fallback(array $payload) {
    $file = dirname(__DIR__, 3) . '/sc-intake-fallback.jsonl';
    $line = json_encode($payload + ['saved_at' => date('c')], JSON_UNESCAPED_UNICODE) . "\n";
    if (@file_put_contents($file, $line, FILE_APPEND | LOCK_EX) === false) {
        error_log('crm-lead.php: fallback file not writable');
    }
}

function sc_send_to_crm($type, array $data) {
    $configFile = __DIR__ . '/crm-config.php';
    if (!is_file($configFile) || !function_exists('curl_init')) {
        return false;
    }

    $config = require $configFile;
    $url    = is_array($config) ? trim($config['url'] ?? '') : '';
    $secret = is_array($config) ? trim($config['secret'] ?? '') : '';
    if ($url === '' || $secret === '') {
        return false;
    }

    $payload = ['type' => $type] + $data;

    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => json_encode($payload, JSON_UNESCAPED_UNICODE),
        CURLOPT_RETURNTRANSFER => true,
        // Short timeouts: the person is waiting on the form, and the mail to
        // hola@ does not depend on the CRM answering.
        CURLOPT_CONNECTTIMEOUT => 3,
        CURLOPT_TIMEOUT        => 6,
        CURLOPT_HTTPHEADER     => [
            'Content-Type: application/json',
            'Authorization: Bearer ' . $secret,
            'X-SC-Intake-Secret: ' . $secret,
        ],
    ]);
    $response = curl_exec($ch);
    $status   = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error    = curl_error($ch);
    // No curl_close(): since PHP 8.0 it has no effect (the handle is freed on its own),
    // and PHP 8.5 reports it as deprecated, which would print a notice before the JSON.

    if ($response === false || $status < 200 || $status >= 300) {
        error_log('crm-lead.php: HTTP ' . $status . ' ' . $error);
        sc_crm_fallback($payload);
        return false;
    }
    return true;
}

// Contact form: kept as a thin wrapper so contact-form.php does not change.
function sc_send_lead_to_crm(array $lead) {
    return sc_send_to_crm('lead', $lead);
}
