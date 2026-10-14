<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Core\Database;
use App\Core\Response;
use App\Core\Session;
use App\Core\Validator;

final class AccessController
{
    public function inviteCode(): void
    {
        $u = Session::requireStaff();
        $pdo = Database::pdo();
        $stmt = $pdo->prepare('SELECT code FROM company_invites WHERE company_id = :c');
        $stmt->execute([':c' => $u['company_id']]);
        $row = $stmt->fetch();
        if (!$row) {
            $code = bin2hex(random_bytes(24));
            $ins = $pdo->prepare('INSERT INTO company_invites (company_id, code) VALUES (:c, :code)');
            $ins->execute([':c' => $u['company_id'], ':code' => $code]);
            $row = ['code' => $code];
        }
        Response::json(['code' => $row['code']]);
    }

    public function regenerateCode(): void
    {
        $u = Session::requireStaff();
        $pdo = Database::pdo();
        $code = bin2hex(random_bytes(24));
        $stmt = $pdo->prepare('UPDATE company_invites SET code = :code WHERE company_id = :c');
        $stmt->execute([':code' => $code, ':c' => $u['company_id']]);
        if ($stmt->rowCount() === 0) {
            $ins = $pdo->prepare('INSERT INTO company_invites (company_id, code) VALUES (:c, :code)');
            $ins->execute([':c' => $u['company_id'], ':code' => $code]);
        }
        Response::json(['code' => $code]);
    }

    public function teamUsers(): void
    {
        $u = Session::requireStaff();
        $pdo = Database::pdo();
        $stmt = $pdo->prepare('SELECT u.id, u.name, u.email, u.role, u.status, u.employee_id, e.nome AS employee_nome FROM users u LEFT JOIN employees e ON e.id = u.employee_id WHERE u.company_id = :c ORDER BY u.name');
        $stmt->execute([':c' => $u['company_id']]);
        $users = $stmt->fetchAll();
        $asg = $pdo->prepare('SELECT a.user_id, a.linha_id, l.codigo, l.nome FROM line_assignments a JOIN linhas l ON l.id = a.linha_id JOIN users u ON u.id = a.user_id WHERE u.company_id = :c ORDER BY l.codigo');
        $asg->execute([':c' => $u['company_id']]);
        $byUser = [];
        foreach ($asg->fetchAll() as $r) {
            $byUser[(int)$r['user_id']][] = ['id' => (int)$r['linha_id'], 'codigo' => $r['codigo'], 'nome' => $r['nome']];
        }
        foreach ($users as &$row) {
            $row['id'] = (int)$row['id'];
            $row['linhas'] = $byUser[$row['id']] ?? [];
        }
        Response::json(['data' => $users]);
    }

    public function pending(): void
    {
        $u = Session::requireStaff();
        $pdo = Database::pdo();
        $stmt = $pdo->prepare("SELECT id, name, email, created_at FROM users WHERE company_id = :c AND role = 'funcionario' AND status = 'pending' ORDER BY created_at");
        $stmt->execute([':c' => $u['company_id']]);
        Response::json(['data' => $stmt->fetchAll()]);
    }

    public function createUser(): void
    {
        $u = Session::requireStaff();
        $b = Validator::body();
        $name = Validator::str($b['name'] ?? null, 2, 120);
        $email = Validator::email($b['email'] ?? null);
        $pass = $b['password'] ?? '';
        if (!$name || !$email || !is_string($pass) || strlen($pass) < 8) {
            Response::error('Informe nome, e-mail válido e senha (mín. 8).', 422);
        }
        $pdo = Database::pdo();
        $exists = $pdo->prepare('SELECT id FROM users WHERE email = :e');
        $exists->execute([':e' => $email]);
        if ($exists->fetch()) {
            Response::error('E-mail já cadastrado.', 409);
        }
        $employeeId = null;
        if (isset($b['employee_id']) && $b['employee_id'] !== '' && $b['employee_id'] !== null) {
            $chk = $pdo->prepare('SELECT id FROM employees WHERE id = :id AND company_id = :c');
            $chk->execute([':id' => $b['employee_id'], ':c' => $u['company_id']]);
            $emp = $chk->fetch();
            if (!$emp) {
                Response::error('Funcionário não encontrado nesta empresa.', 422);
            }
            $linked = $pdo->prepare('SELECT id FROM users WHERE employee_id = :emp');
            $linked->execute([':emp' => $emp['id']]);
            if ($linked->fetch()) {
                Response::error('Este funcionário já possui acesso.', 409);
            }
            $employeeId = (int)$emp['id'];
        }
        $hash = password_hash($pass, PASSWORD_ARGON2ID);
        $pdo->beginTransaction();
        try {
            $ins = $pdo->prepare("INSERT INTO users (company_id, employee_id, name, email, password_hash, role, status) VALUES (:c, :emp, :n, :e, :h, 'funcionario', 'active')");
            $ins->execute([':c' => $u['company_id'], ':emp' => $employeeId, ':n' => $name, ':e' => $email, ':h' => $hash]);
            $id = Database::lastId($pdo, 'users');
            $this->replaceAssignments($pdo, (int)$u['company_id'], $id, $b['linha_ids'] ?? []);
            $pdo->commit();
        } catch (\Throwable $e) {
            $pdo->rollBack();
            Response::error('Falha ao criar acesso.', 500);
        }
        Response::json(['message' => 'Acesso criado.', 'id' => $id], 201);
    }

    public function approve(string $id): void
    {
        $u = Session::requireStaff();
        $pdo = Database::pdo();
        $target = $this->assertFuncionario($pdo, $u, $id);
        if ($target['status'] === 'active') {
            Response::json(['message' => 'Acesso já estava ativo.']);
        }
        $b = Validator::body();
        $pdo->beginTransaction();
        try {
            $pdo->prepare('UPDATE users SET status = :s WHERE id = :id')->execute([':s' => 'active', ':id' => $id]);
            $this->replaceAssignments($pdo, (int)$u['company_id'], (int)$id, $b['linha_ids'] ?? []);
            $pdo->commit();
        } catch (\Throwable $e) {
            $pdo->rollBack();
            Response::error('Falha ao aprovar.', 500);
        }
        Response::json(['message' => 'Acesso aprovado.']);
    }

    public function remove(string $id): void
    {
        $u = Session::requireStaff();
        $pdo = Database::pdo();
        $this->assertFuncionario($pdo, $u, $id);
        try {
            $pdo->prepare('DELETE FROM users WHERE id = :id')->execute([':id' => $id]);
        } catch (\Throwable $e) {
            Response::error('Falha ao remover.', 500);
        }
        Response::json(['message' => 'Acesso removido.']);
    }

    public function assign(string $id): void
    {
        $u = Session::requireStaff();
        $pdo = Database::pdo();
        $this->assertFuncionario($pdo, $u, $id);
        $b = Validator::body();
        $pdo->beginTransaction();
        try {
            $this->replaceAssignments($pdo, (int)$u['company_id'], (int)$id, $b['linha_ids'] ?? []);
            $pdo->commit();
        } catch (\Throwable $e) {
            $pdo->rollBack();
            Response::error('Falha ao salvar atribuições.', 500);
        }
        Response::json(['message' => 'Linhas atribuídas.']);
    }

    private function assertFuncionario(\PDO $pdo, array $u, string $id): array
    {
        $stmt = $pdo->prepare("SELECT * FROM users WHERE id = :id AND company_id = :c AND role = 'funcionario'");
        $stmt->execute([':id' => $id, ':c' => $u['company_id']]);
        $row = $stmt->fetch();
        if (!$row) {
            Response::error('Acesso não encontrado nesta empresa.', 404);
        }
        return $row;
    }

    private function replaceAssignments(\PDO $pdo, int $companyId, int $userId, mixed $linhaIds): void
    {
        $ids = is_array($linhaIds) ? array_values(array_unique(array_map('intval', $linhaIds))) : [];
        if ($ids) {
            $place = implode(',', array_fill(0, count($ids), '?'));
            $chk = $pdo->prepare("SELECT id FROM linhas WHERE company_id = ? AND id IN ({$place})");
            $chk->execute(array_merge([$companyId], $ids));
            $valid = array_map('intval', array_column($chk->fetchAll(), 'id'));
        } else {
            $valid = [];
        }
        $pdo->prepare('DELETE FROM line_assignments WHERE user_id = :u')->execute([':u' => $userId]);
        $ins = $pdo->prepare('INSERT INTO line_assignments (user_id, linha_id) VALUES (:u, :l)');
        foreach ($valid as $lid) {
            $ins->execute([':u' => $userId, ':l' => $lid]);
        }
    }
}
