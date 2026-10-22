<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Core\Database;
use App\Core\Response;
use App\Core\Session;
use App\Core\Validator;

final class FuncionarioController
{
    public function index(): void
    {
        $u = Session::requireStaff();
        $pdo = Database::pdo();
        $stmt = $pdo->prepare('SELECT * FROM employees WHERE company_id = :c ORDER BY nome');
        $stmt->execute([':c' => $u['company_id']]);
        Response::json(['data' => $stmt->fetchAll()]);
    }

    public function store(): void
    {
        $u = Session::requireStaff();
        $b = Validator::body();
        $nome = Validator::str($b['nome'] ?? null, 2, 120);
        $cargo = Validator::str($b['cargo'] ?? null, 2, 120);
        $email = isset($b['email']) && $b['email'] !== '' ? Validator::email($b['email']) : null;
        $tel = isset($b['telefone']) ? Validator::str($b['telefone'], 1, 30) : null;
        if (!$nome || !$cargo) {
            Response::error('Nome e cargo são obrigatórios.', 422);
        }
        if (isset($b['email']) && $b['email'] !== '' && $email === null) {
            Response::error('E-mail inválido.', 422);
        }
        $pdo = Database::pdo();
        $stmt = $pdo->prepare('INSERT INTO employees (company_id, nome, cargo, email, telefone) VALUES (:c, :n, :ca, :e, :t)');
        $stmt->execute([':c' => $u['company_id'], ':n' => $nome, ':ca' => $cargo, ':e' => $email, ':t' => $tel]);
        Response::json(['message' => 'Funcionário criado.', 'id' => Database::lastId($pdo, 'employees')], 201);
    }

    public function update(string $id): void
    {
        $u = Session::requireStaff();
        $pdo = Database::pdo();
        $this->assertOwner($pdo, $u, $id);
        $b = Validator::body();
        $sets = [];
        $p = [':id' => $id];
        if (isset($b['nome'])) {
            $v = Validator::str($b['nome'], 2, 120);
            if (!$v) {
                Response::error('Nome inválido.', 422);
            } $sets[] = 'nome = :nome';
            $p[':nome'] = $v;
        }
        if (isset($b['cargo'])) {
            $v = Validator::str($b['cargo'], 2, 120);
            if (!$v) {
                Response::error('Cargo inválido.', 422);
            } $sets[] = 'cargo = :cargo';
            $p[':cargo'] = $v;
        }
        if (array_key_exists('email', $b)) {
            $v = ($b['email'] === '' || $b['email'] === null) ? null : Validator::email($b['email']);
            if ($b['email'] !== '' && $b['email'] !== null && !$v) {
                Response::error('E-mail inválido.', 422);
            } $sets[] = 'email = :email';
            $p[':email'] = $v;
        }
        if (array_key_exists('telefone', $b)) {
            $sets[] = 'telefone = :tel';
            $p[':tel'] = $b['telefone'] ? substr(trim((string)$b['telefone']), 0, 30) : null;
        }
        if ($sets) {
            $pdo->prepare('UPDATE employees SET ' . implode(', ', $sets) . ' WHERE id = :id')->execute($p);
        }
        Response::json(['message' => 'Funcionário atualizado.']);
    }

    public function destroy(string $id): void
    {
        $u = Session::requireStaff();
        $pdo = Database::pdo();
        $this->assertOwner($pdo, $u, $id);
        $pdo->prepare('DELETE FROM employees WHERE id = :id')->execute([':id' => $id]);
        Response::json(['message' => 'Funcionário excluído.']);
    }

    private function assertOwner(\PDO $pdo, array $u, string $id): void
    {
        $stmt = $pdo->prepare('SELECT id FROM employees WHERE id = :id AND company_id = :c');
        $stmt->execute([':id' => $id, ':c' => $u['company_id']]);
        if (!$stmt->fetch()) {
            Response::error('Registro não encontrado ou sem permissão.', 404);
        }
    }
}
