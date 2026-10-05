<?php
// Sends a website contact to the CRM as a prospect (POST /api/integrations/leads).
//
// The CRM address and secret live in assets/mail/crm-config.php, which exists
// only on the server (.gitignore blocks *config*.php; the repo is public):
//
//   <?php return ['url' => 'https://<crm>/api/integrations/leads', 'secret' => '<LEAD_INTAKE_SECRET>'];
//
// Without that file the function does nothing and returns false, so the code can
// be uploaded before the CRM is live without touching how the forms work today.

function sc_send_lead_to_crm(array $lead) {
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

    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => json_encode($lead, JSON_UNESCAPED_UNICODE),
        CURLOPT_RETURNTRANSFER => true,
        // Short timeouts: the person is waiting on the form, and the mail to
        // hola@ does not depend on the CRM answering.
        CURLOPT_CONNECTTIMEOUT => 3,
        CURLOPT_TIMEOUT        => 6,
        CURLOPT_HTTPHEADER     => [
            'Content-Type: application/json',
            'Authorization: Bearer ' . $secret,
        ],
    ]);
    $response = curl_exec($ch);
    $status   = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error    = curl_error($ch);
    curl_close($ch);

    if ($response === false || $status < 200 || $status >= 300) {
        error_log('crm-lead.php: HTTP ' . $status . ' ' . $error);
        return false;
    }
    return true;
}
