<?php
/**
 * AmadursInsight — server proxy for shared hosting (Namecheap / cPanel).
 *
 * Holds the Anthropic API key server-side, forwards the notes to the model with
 * a forced strict-schema tool call, and returns the raw tool output. The
 * browser does the ID/graph repair (normalize) — no secret is involved there.
 *
 * Deploy: this file goes in  public_html/api/generate.php
 *         extraction-schema.json sits next to it (the build script copies it)
 *         amadursinsight-secrets.php sits ONE LEVEL ABOVE public_html
 */

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

function fail(int $status, string $message): void {
    http_response_code($status);
    echo json_encode(['error' => $message]);
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    fail(405, 'Use POST.');
}

/* ---- secrets: look above the document root, then fall back beside this file ---- */
$candidates = [
    __DIR__ . '/../../amadursinsight-secrets.php',
    __DIR__ . '/../amadursinsight-secrets.php',
    __DIR__ . '/amadursinsight-secrets.php',
];
$secrets = null;
foreach ($candidates as $path) {
    if (is_file($path)) { $secrets = require $path; break; }
}
if (!is_array($secrets)) {
    fail(500, 'Server is not configured: amadursinsight-secrets.php was not found.');
}

$apiKey      = trim((string) ($secrets['api_key'] ?? ''));
$workspaceId = trim((string) ($secrets['workspace_id'] ?? ''));
$model       = trim((string) ($secrets['model'] ?? '')) ?: 'claude-sonnet-5';
if ($apiKey === '') {
    fail(500, 'Server is missing the Anthropic API key.');
}

/* ---- input ---- */
$raw = file_get_contents('php://input');
$body = json_decode($raw, true);
$notes = is_array($body) ? trim((string) ($body['notes'] ?? '')) : '';

$len = function_exists('mb_strlen') ? mb_strlen($notes) : strlen($notes);
if ($len < 40) {
    fail(400, 'Add more detail to the notes before generating.');
}
if ($len > 15000) {
    fail(400, 'Notes exceed the 15,000-character limit.');
}

/* ---- schema (shared with the TypeScript client) ---- */
$schemaJson = @file_get_contents(__DIR__ . '/extraction-schema.json');
$schema = $schemaJson ? json_decode($schemaJson, true) : null;
if (!is_array($schema)) {
    fail(500, 'Server schema file is missing or invalid.');
}

$system = @file_get_contents(__DIR__ . '/system-prompt.txt');
if ($system === false || trim($system) === '') {
    fail(500, 'Server prompt file is missing.');
}

$payload = [
    'model'         => $model,
    'max_tokens'    => 16000,
    'thinking'      => ['type' => 'adaptive'],
    'output_config' => ['effort' => 'low'],
    'system'        => $system,
    'tools'         => [[
        'name'         => 'record_requirements',
        'description'  => 'Record the structured requirements draft extracted from the meeting notes.',
        'strict'       => true,
        'input_schema' => $schema,
    ]],
    'tool_choice'   => ['type' => 'tool', 'name' => 'record_requirements'],
    'messages'      => [['role' => 'user', 'content' => "Meeting notes:\n\n" . $notes]],
];

$headers = [
    'content-type: application/json',
    'x-api-key: ' . $apiKey,
    'anthropic-version: 2023-06-01',
];
if ($workspaceId !== '') {
    $headers[] = 'anthropic-workspace-id: ' . $workspaceId;
}

/* ---- call Anthropic (cURL, with a stream fallback) ---- */
$endpoint = 'https://api.anthropic.com/v1/messages';
$bodyJson = json_encode($payload);
$respBody = null;
$httpCode = 0;
$transportError = '';

if (function_exists('curl_init')) {
    $ch = curl_init($endpoint);
    curl_setopt_array($ch, [
        CURLOPT_POST           => true,
        CURLOPT_HTTPHEADER     => $headers,
        CURLOPT_POSTFIELDS     => $bodyJson,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT        => 90,
        CURLOPT_CONNECTTIMEOUT => 15,
    ]);
    $respBody = curl_exec($ch);
    $httpCode = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
    if ($respBody === false) {
        $transportError = curl_error($ch);
        $respBody = null;
    }
    curl_close($ch);
} else {
    $context = stream_context_create(['http' => [
        'method'        => 'POST',
        'header'        => implode("\r\n", $headers),
        'content'       => $bodyJson,
        'timeout'       => 90,
        'ignore_errors' => true,
    ]]);
    $respBody = @file_get_contents($endpoint, false, $context);
    if (isset($http_response_header[0]) && preg_match('/\s(\d{3})\s/', $http_response_header[0], $m)) {
        $httpCode = (int) $m[1];
    }
    if ($respBody === false) {
        $transportError = 'stream request failed';
        $respBody = null;
    }
}

if ($respBody === null) {
    fail(502, 'Could not reach the model API. ' . $transportError);
}

$data = json_decode($respBody, true);

if ($httpCode >= 400) {
    $detail = is_array($data) ? ($data['error']['message'] ?? '') : '';
    fail(502, 'The model API rejected the request' . ($detail !== '' ? ' — ' . $detail : '.'));
}
if (!is_array($data)) {
    fail(502, 'The model API returned an unreadable response.');
}
if (($data['stop_reason'] ?? '') === 'refusal') {
    fail(422, 'The model declined to process these notes. Try rewording them.');
}

$toolInput = null;
foreach (($data['content'] ?? []) as $block) {
    if (is_array($block) && ($block['type'] ?? '') === 'tool_use') {
        $toolInput = $block['input'] ?? null;
        break;
    }
}
if ($toolInput === null) {
    fail(502, 'The model did not return a structured result. Try again.');
}

echo json_encode(['model' => $toolInput]);
