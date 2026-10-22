<?php

declare(strict_types=1);

namespace App\Core;

use PDO;
use PDOException;

final class Database
{
    private static ?PDO $pdo = null;

    public static function driver(): string
    {
        $d = strtolower(trim($_ENV['DB_DRIVER'] ?? 'mysql'));
        return $d === 'pgsql' || $d === 'postgres' || $d === 'postgresql' ? 'pgsql' : 'mysql';
    }

    public static function pdo(): PDO
    {
        if (self::$pdo) {
            return self::$pdo;
        }
        $driver = self::driver();
        $host = $_ENV['DB_HOST'] ?? '127.0.0.1';
        $port = $_ENV['DB_PORT'] ?? ($driver === 'pgsql' ? '5432' : '3306');
        $name = $_ENV['DB_NAME'] ?? 'transcamacari';
        $user = $_ENV['DB_USER'] ?? 'root';
        $pass = $_ENV['DB_PASS'] ?? '';
        $dsn = $driver === 'pgsql'
            ? "pgsql:host={$host};port={$port};dbname={$name}"
            : "mysql:host={$host};port={$port};dbname={$name};charset=utf8mb4";
        try {
            self::$pdo = new PDO($dsn, $user, $pass, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['message' => 'Falha de conexão com o banco.']);
            exit;
        }
        return self::$pdo;
    }


    public static function horariosAgg(): string
    {
        return self::driver() === 'pgsql'
            ? "string_agg(h.horario::text, ',' ORDER BY h.horario)"
            : "GROUP_CONCAT(h.horario ORDER BY h.horario SEPARATOR ',')";
    }


    public static function likeOp(): string
    {
        return self::driver() === 'pgsql' ? 'ILIKE' : 'LIKE';
    }


    public static function lastId(PDO $pdo, string $table): int
    {
        if (self::driver() === 'pgsql') {
            return (int)$pdo->lastInsertId("{$table}_id_seq");
        }
        return (int)$pdo->lastInsertId();
    }
}
