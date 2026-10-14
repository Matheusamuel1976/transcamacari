<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Core\Database;
use App\Core\Response;
use App\Core\Session;
use App\Core\Validator;
use App\Core\RateLimit;

final class AuthController
{
    public function register(): void
    {
        $b = Validator::body();
        $name = Validator::str($b['name'] ?? null, 2, 120);
        $email = Validator::email($b['email'] ?? null);
        $pass = $b['password'] ?? '';
        $code = isset($b['company_code']) && is_string($b['company_code']) ? trim($b['company_code']) : '';
        if (!$name || !$email || !is_string($pass) || strlen($pass) < 8) {
            Response::error('Dados inválidos. Verifique nome, e-mail e senha (mín. 8).', 422);
        }
        if ($code !== '') {
            $this->registerFuncionario($name, $email, $pass, $code);
        }
        $company = Validator::str($b['company'] ?? null, 2, 150);
        if (!$company) {
            Response::error('Dados inválidos. Verifique nome, empresa, e-mail e senha (mín. 8).', 422);
        }
        if (!RateLimit::check('reg:' . ($_SERVER['REMOTE_ADDR'] ?? 'x'), 10, 3600)) {
            Response::error('Muitas tentativas. Tente mais tarde.', 429);
        }
        $pdo = Database::pdo();
        $exists = $pdo->prepare('SELECT id FROM users WHERE email = :e');
        $exists->execute([':e' => $email]);
        if ($exists->fetch()) {
            Response::error('E-mail já cadastrado.', 409);
        }

        $pdo->beginTransaction();
        try {
            $c = $pdo->prepare('INSERT INTO companies (nome) VALUES (:n)');
            $c->execute([':n' => $company]);
            $companyId = Database::lastId($pdo, 'companies');
            $hash = password_hash($pass, PASSWORD_ARGON2ID);
            $u = $pdo->prepare('INSERT INTO users (company_id, name, email, password_hash, role) VALUES (:c, :n, :e, :h, \'admin\')');
            $u->execute([':c' => $companyId, ':n' => $name, ':e' => $email, ':h' => $hash]);
            $pdo->commit();
        } catch (\Throwable $e) {
            $pdo->rollBack();
            Response::error('Falha ao cadastrar.', 500);
        }
        Response::json(['message' => 'Cadastro realizado com sucesso.']);
    }

    private function registerFuncionario(string $name, string $email, string $pass, string $code): void
    {
        if (!RateLimit::check('reg:' . ($_SERVER['REMOTE_ADDR'] ?? 'x'), 10, 3600)) {
            Response::error('Muitas tentativas. Tente mais tarde.', 429);
        }
        $pdo = Database::pdo();
        $inv = $pdo->prepare('SELECT company_id FROM company_invites WHERE code = :code');
        $inv->execute([':code' => $code]);
        $row = $inv->fetch();
        if (!$row) {
            Response::error('Código da empresa inválido. Confira com o responsável.', 422);
        }
        $exists = $pdo->prepare('SELECT id FROM users WHERE email = :e');
        $exists->execute([':e' => $email]);
        if ($exists->fetch()) {
            Response::error('E-mail já cadastrado.', 409);
        }
        $hash = password_hash($pass, PASSWORD_ARGON2ID);
        $u = $pdo->prepare("INSERT INTO users (company_id, name, email, password_hash, role, status) VALUES (:c, :n, :e, :h, 'funcionario', 'pending')");
        $u->execute([':c' => $row['company_id'], ':n' => $name, ':e' => $email, ':h' => $hash]);
        Response::json(['message' => 'Cadastro enviado. Aguarde a aprovação da empresa para entrar.']);
    }

    public function login(): void
    {
        $b = Validator::body();
        $email = Validator::email($b['email'] ?? null);
        $pass = $b['password'] ?? '';
        if (!$email || !is_string($pass) || $pass === '') {
            Response::error('Credenciais inválidas.', 422);
        }
        if (!RateLimit::check('login:' . ($_SERVER['REMOTE_ADDR'] ?? 'x'), 10, 600)) {
            Response::error('Muitas tentativas. Tente mais tarde.', 429);
        }
        $pdo = Database::pdo();
        $stmt = $pdo->prepare('SELECT u.*, c.nome AS company_nome FROM users u JOIN companies c ON c.id = u.company_id WHERE u.email = :e LIMIT 1');
        $stmt->execute([':e' => $email]);
        $user = $stmt->fetch();
        if (!$user || !password_verify($pass, $user['password_hash'])) {
            Response::error('E-mail ou senha incorretos.', 401);
        }
        if (($user['status'] ?? 'active') !== 'active') {
            Response::error('Cadastro aguardando aprovação da empresa.', 403);
        }
        Session::setUser([
            'id' => (int)$user['id'],
            'company_id' => (int)$user['company_id'],
            'name' => $user['name'],
            'email' => $user['email'],
            'role' => $user['role'],
            'company' => $user['company_nome'],
        ]);
        Response::json(['message' => 'Login OK.', 'user' => Session::user()]);
    }

    public function logout(): void
    {
        Session::destroy();
        Response::json(['message' => 'Logout OK.']);
    }

    public function me(): void
    {
        $u = Session::requireAuth();
        Response::json(['user' => $u]);
    }

    public function profile(): void
    {
        $u = Session::requireAuth();
        $b = Validator::body();
        $name = Validator::str($b['name'] ?? null, 2, 120);
        if (!$name) {
            Response::error('Informe um nome entre 2 e 120 caracteres.', 422);
        }
        $stmt = Database::pdo()->prepare('UPDATE users SET name = :n WHERE id = :id AND company_id = :c');
        $stmt->execute([':n' => $name, ':id' => $u['id'], ':c' => $u['company_id']]);
        $u['name'] = $name;
        Session::setUser($u);
        Response::json(['message' => 'Nome atualizado.', 'user' => $u]);
    }
}
