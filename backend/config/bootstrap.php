<?php

declare(strict_types=1);


$root = dirname(__DIR__);

if (file_exists($root . '/vendor/autoload.php')) {
    require $root . '/vendor/autoload.php';
} else {
    spl_autoload_register(function ($class) use ($root) {
        $prefix = 'App\\';
        if (str_starts_with($class, $prefix)) {
            $rel = str_replace('\\', '/', substr($class, strlen($prefix)));
            $file = $root . '/app/' . $rel . '.php';
            if (file_exists($file)) {
                require $file;
            }
        }
    });
}


$envFile = $root . '/.env';
if (file_exists($envFile)) {
    foreach (file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
        $line = trim($line);
        if ($line === '' || str_starts_with($line, '#')) {
            continue;
        }
        [$k, $v] = array_pad(explode('=', $line, 2), 2, '');
        $_ENV[trim($k)] = trim($v);
    }
}

$frontend = $_ENV['FRONTEND_URL'] ?? 'http://localhost:3000';
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin === $frontend) {
    header("Access-Control-Allow-Origin: {$frontend}");
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, X-Requested-With, X-CSRF-Token');
}

\App\Core\Session::start();
