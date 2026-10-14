<?php

declare(strict_types=1);

namespace App\Core;

use App\Core\Database;

final class RateLimit
{
    public static function check(string $key, int $max = 5, int $windowSeconds = 600): bool
    {
        $pdo = Database::pdo();
        $stmt = $pdo->prepare('SELECT * FROM rate_limits WHERE chave = :k');
        $stmt->execute([':k' => $key]);
        $row = $stmt->fetch();
        $now = time();
        if (!$row) {
            $ins = $pdo->prepare('INSERT INTO rate_limits (chave, janela_inicio, tentativas) VALUES (:k, NOW(), 1)');
            $ins->execute([':k' => $key]);
            return true;
        }
        $start = strtotime($row['janela_inicio']);
        if ($now - $start > $windowSeconds) {
            $upd = $pdo->prepare('UPDATE rate_limits SET janela_inicio = NOW(), tentativas = 1 WHERE chave = :k');
            $upd->execute([':k' => $key]);
            return true;
        }
        if ((int)$row['tentativas'] >= $max) {
            return false;
        }
        $upd = $pdo->prepare('UPDATE rate_limits SET tentativas = tentativas + 1 WHERE chave = :k');
        $upd->execute([':k' => $key]);
        return true;
    }
}
