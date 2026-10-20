<?php
// Shared helpers for the closer application forms (stage 1: data, stage 2: video).

// Base URL of the closer pages. Uses the host of the request only when it is
// one of ours (production or the dev copy), so a spoofed Host header can never
// end up inside the stage 2 links.
function sc_closer_site_base() {
    $allowed = ['studiocomplex.com.ar', 'www.studiocomplex.com.ar', 'dev1.sebastiancanori.com.ar'];
    $host = strtolower($_SERVER['HTTP_HOST'] ?? '');
    if (!in_array($host, $allowed, true)) {
        return 'https://studiocomplex.com.ar';
    }
    // assets/mail/closer-*.php -> folder that holds the pages
    $dir = rtrim(dirname(dirname(dirname($_SERVER['SCRIPT_NAME'] ?? '/'))), '/\\');
    return 'https://' . $host . $dir;
}

function sc_closer_stage2_url($email) {
    return sc_closer_site_base() . '/closers-perfil.html?e=' . rawurlencode(strtolower(trim($email)));
}

function sc_closer_respond($status, $message, array $extra = []) {
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['status' => $status, 'message' => $message] + $extra);
    exit;
}

// Minimum to see the invitation to stage 2 right after applying (closers.js applies the same cut):
// at least one year closing sales and experience selling to SME owners.
function sc_closer_qualifies($experience, $b2b) {
    $years = in_array($experience, ['De 1 a 3 años', 'Más de 3 años'], true);
    $smes  = in_array($b2b, ['Sí, servicios digitales', 'Sí, otros servicios o productos'], true);
    return $years && $smes;
}

function sc_closer_clean($value, $max = 1000) {
    $value = trim((string) $value);
    return mb_substr($value, 0, $max);
}
