<?php

declare(strict_types=1);

namespace App\Core;

final class Session
{
    public static function start(): void
    {
        if (session_status() === PHP_SESSION_ACTIVE) {
            return;
        }
        $name = $_ENV['SESSION_NAME'] ?? 'TCSESSID';
        session_name($name);
        session_set_cookie_params([
            'lifetime' => 0,
            'path' => '/',
            'httponly' => true,
            'secure' => ($_ENV['SESSION_SECURE'] ?? 'false') === 'true',
            'samesite' => $_ENV['SESSION_SAMESITE'] ?? 'Lax',
        ]);
        session_start();
    }

    public static function user(): ?array
    {
        return $_SESSION['user'] ?? null;
    }

    public static function setUser(array $user): void
    {
        session_regenerate_id(true);
        $_SESSION['user'] = $user;
    }

    public static function destroy(): void
    {
        $_SESSION = [];
        if (ini_get('session.use_cookies')) {
            $p = session_get_cookie_params();
            setcookie(session_name(), '', time() - 42000, $p['path'], '', $p['secure'], $p['httponly']);
        }
        session_destroy();
    }

    public static function requireAuth(): array
    {
        $u = self::user();
        if (!$u) {
            Response::error('Não autenticado.', 401);
        }
        return $u;
    }

    public static function csrfToken(): string
    {
        if (empty($_SESSION['csrf'])) {
            $_SESSION['csrf'] = bin2hex(random_bytes(32));
        }
        return $_SESSION['csrf'];
    }

    public static function checkCsrf(): void
    {
        $sent = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
        $session = $_SESSION['csrf'] ?? '';
        if ($session === '' || !is_string($sent) || !hash_equals($session, $sent)) {
            Response::error('Token CSRF inválido ou ausente.', 419);
        }
    }
}
