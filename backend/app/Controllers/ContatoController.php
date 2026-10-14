<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Core\Database;
use App\Core\Response;
use App\Core\Validator;
use App\Core\RateLimit;
use PHPMailer\PHPMailer\PHPMailer;

final class ContatoController
{
    public function store(): void
    {
        $b = Validator::body();

        if (!empty($b['website'])) {
            Response::json(['message' => 'Mensagem recebida.']);
        }
        $nome = Validator::str($b['nome'] ?? null, 2, 120);
        $email = Validator::email($b['email'] ?? null);
        $assunto = Validator::str($b['assunto'] ?? null, 3, 150);
        $mensagem = Validator::str($b['mensagem'] ?? null, 10, 2000);
        if (!$nome || !$email || !$assunto || !$mensagem) {
            Response::error('Preencha nome, e-mail válido, assunto e mensagem (mín. 10).', 422);
        }

        $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
        if (!RateLimit::check('contato:' . $ip, 5, 3600)) {
            Response::error('Limite de envios atingido. Tente mais tarde.', 429);
        }

        $pdo = Database::pdo();
        $stmt = $pdo->prepare('INSERT INTO contact_messages (nome, email, assunto, mensagem, ip) VALUES (:n, :e, :a, :m, :ip)');
        $stmt->execute([':n' => $nome, ':e' => $email, ':a' => $assunto, ':m' => $mensagem, ':ip' => substr($ip, 0, 45)]);


        $host = $_ENV['SMTP_HOST'] ?? '';
        $user = $_ENV['SMTP_USER'] ?? '';
        if ($host === '' || $user === '' || str_contains($host, 'example.com')) {
            Response::json(['message' => 'Mensagem registrada. O envio por e-mail está indisponível no momento.', 'delivery' => 'stored']);
        }
        try {
            $mail = new PHPMailer(true);
            $mail->isSMTP();
            $mail->Host = $host;
            $mail->Port = (int)($_ENV['SMTP_PORT'] ?? 587);
            $mail->SMTPAuth = true;
            $mail->Username = $user;
            $mail->Password = $_ENV['SMTP_PASS'] ?? '';
            $mail->SMTPSecure = ($_ENV['SMTP_ENCRYPTION'] ?? 'tls') === 'ssl' ? PHPMailer::ENCRYPTION_SMTPS : PHPMailer::ENCRYPTION_STARTTLS;
            $mail->CharSet = 'UTF-8';
            $mail->setFrom($_ENV['SMTP_FROM'] ?? $user, 'TransCamaçari');
            $mail->addAddress($_ENV['SMTP_TO'] ?? $user);
            $mail->addReplyTo($email, $nome);
            $mail->Subject = '[TransCamaçari] ' . $assunto;
            $mail->Body = "Nome: {$nome}\nE-mail: {$email}\nIP: {$ip}\n\n{$mensagem}";
            $mail->send();
        } catch (\Throwable $e) {
            Response::json(['message' => 'Mensagem registrada. Não foi possível entregar o e-mail neste momento.', 'delivery' => 'stored']);
        }
        Response::json(['message' => 'Mensagem enviada com sucesso.', 'delivery' => 'sent']);
    }
}
