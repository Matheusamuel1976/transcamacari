<?php

declare(strict_types=1);

namespace App\Core;

use PDO;

final class Audit
{
    public static function log(PDO $pdo, ?int $companyId, ?int $actorId, string $action, ?int $targetId = null, ?string $meta = null): void
    {
        try {
            $stmt = $pdo->prepare('INSERT INTO access_audit (company_id, actor_id, action, target_id, meta) VALUES (:c, :a, :ac, :t, :m)');
            $stmt->execute([
                ':c' => $companyId,
                ':a' => $actorId,
                ':ac' => substr($action, 0, 60),
                ':t' => $targetId,
                ':m' => $meta !== null ? substr($meta, 0, 500) : null,
            ]);
        } catch (\Throwable $e) {
        }
    }
}
