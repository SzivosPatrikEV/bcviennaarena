<?php
declare(strict_types=1);

function load_env_file(string $file): void {
    if (!is_file($file)) return;
    foreach (file($file, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
        $line = trim($line);
        if ($line === '' || str_starts_with($line, '#') || !str_contains($line, '=')) continue;
        [$key, $value] = explode('=', $line, 2);
        $key = trim($key);
        $value = trim($value);
        if ($value !== '' && (($value[0] === '"' && str_ends_with($value, '"')) || ($value[0] === "'" && str_ends_with($value, "'")))) {
            $value = substr($value, 1, -1);
        }
        if ($key !== '') $_ENV[$key] = $value;
    }
}
load_env_file(dirname(__DIR__) . '/.env');

function envv(string $key, string $default = ''): string {
    return (string)($_ENV[$key] ?? getenv($key) ?: $default);
}

const API_ALLOWED_ORIGINS = [
    'https://szivospatrikev.github.io',
    // Add your custom GitHub Pages/custom-domain origin here if used.
];

function send_json(int $status, array $data): never {
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    header('X-Content-Type-Options: nosniff');
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin !== '' && in_array($origin, API_ALLOWED_ORIGINS, true)) {
    header("Access-Control-Allow-Origin: {$origin}");
    header('Vary: Origin');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
}
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(204);
    exit;
}
if ($origin !== '' && !in_array($origin, API_ALLOWED_ORIGINS, true)) {
    send_json(403, ['error' => 'Origin not allowed.']);
}

function db(): PDO {
    static $pdo = null;
    if ($pdo instanceof PDO) return $pdo;
    $host = envv('DB_HOST');
    $name = envv('DB_NAME');
    $user = envv('DB_USER');
    $pass = envv('DB_PASSWORD');
    if ($host === '' || $name === '' || $user === '') {
        throw new RuntimeException('Database configuration is incomplete.');
    }
    $dsn = 'mysql:host=' . $host . ';port=' . (envv('DB_PORT', '3306')) . ';dbname=' . $name . ';charset=utf8mb4';
    $pdo = new PDO($dsn, $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);
    return $pdo;
}

function require_admin(): void {
    $configured = envv('ADMIN_PASSWORD');
    if ($configured === '') send_json(503, ['error' => 'Admin password is not configured.']);
    $user = $_SERVER['PHP_AUTH_USER'] ?? '';
    $pass = $_SERVER['PHP_AUTH_PW'] ?? '';
    if (!hash_equals('admin', $user) || !hash_equals($configured, $pass)) {
        header('WWW-Authenticate: Basic realm="BC Vienna Arena Admin", charset="UTF-8"');
        send_json(401, ['error' => 'Admin login required.']);
    }
}

function request_json(): array {
    $raw = file_get_contents('php://input');
    if (strlen($raw) > 2000000) send_json(413, ['error' => 'Request too large.']);
    $data = json_decode($raw ?: '{}', true);
    if (!is_array($data)) send_json(400, ['error' => 'Invalid JSON.']);
    return $data;
}

function clean_event(array $input): array {
    $fields = ['title','date','endDate','startTime','endTime','venue','category','artists','description','ticketUrl','imageUrl'];
    $e = [];
    foreach ($fields as $field) $e[$field] = trim((string)($input[$field] ?? ''));
    if ($e['title'] === '' || mb_strlen($e['title']) > 160) throw new InvalidArgumentException('Enter an event name (max. 160 characters).');
    if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $e['date']) || !checkdate((int)substr($e['date'],5,2),(int)substr($e['date'],8,2),(int)substr($e['date'],0,4))) throw new InvalidArgumentException('Choose a valid event date.');
    if ($e['endDate'] === '') $e['endDate'] = $e['date'];
    if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $e['endDate']) || !checkdate((int)substr($e['endDate'],5,2),(int)substr($e['endDate'],8,2),(int)substr($e['endDate'],0,4))) throw new InvalidArgumentException('Choose a valid event end date.');
    if ($e['endDate'] < $e['date']) throw new InvalidArgumentException('The end date cannot be before the start date.');
    foreach (['startTime','endTime'] as $f) if (!preg_match('/^([01]\d|2[0-3]):[0-5]\d$/', $e[$f])) throw new InvalidArgumentException('Choose valid event times.');
    if (($e['endDate'] . 'T' . $e['endTime']) <= ($e['date'] . 'T' . $e['startTime'])) throw new InvalidArgumentException('The event end must be later than its start.');
    if ($e['venue'] === '' || mb_strlen($e['venue']) > 240 || $e['category'] === '' || mb_strlen($e['category']) > 100) throw new InvalidArgumentException('Enter a valid venue and category.');
    if (mb_strlen($e['artists']) > 1000 || mb_strlen($e['description']) > 10000) throw new InvalidArgumentException('Artist or description text is too long.');
    foreach (['ticketUrl','imageUrl'] as $f) if ($e[$f] !== '' && (!filter_var($e[$f], FILTER_VALIDATE_URL) || !in_array(parse_url($e[$f], PHP_URL_SCHEME), ['http','https'], true))) throw new InvalidArgumentException('Only valid HTTP and HTTPS links are allowed.');
    $e['published'] = !empty($input['published']) ? 1 : 0;
    return $e;
}
