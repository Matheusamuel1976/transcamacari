<?php

declare(strict_types=1);

namespace App\Core;

final class Validator
{
    public static function str(mixed $v, int $min = 1, int $max = 190): ?string
    {
        if (!is_string($v)) {
            return null;
        }
        $v = trim($v);
        $len = mb_strlen($v);
        if ($len < $min || $len > $max) {
            return null;
        }
        return $v;
    }

    public static function email(mixed $v): ?string
    {
        if (!is_string($v)) {
            return null;
        }
        $v = trim($v);
        return filter_var($v, FILTER_VALIDATE_EMAIL) ? $v : null;
    }

    public static function body(): array
    {
        $raw = file_get_contents('php://input') ?: '{}';
        $data = json_decode($raw, true);
        return is_array($data) ? $data : [];
    }
}
