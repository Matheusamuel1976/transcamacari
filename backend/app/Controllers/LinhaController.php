<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Core\Database;
use App\Core\Response;
use App\Core\Session;
use App\Core\Validator;

final class LinhaController
{
    public function index(): void
    {
        $u = Session::user();
        $q = trim($_GET['q'] ?? '');
        $pdo = Database::pdo();
        $agg = Database::horariosAgg();
        $like = Database::likeOp();
        if ($u) {
            if ($q !== '') {
                $stmt = $pdo->prepare("SELECT l.*, {$agg} AS horarios FROM linhas l LEFT JOIN horarios h ON h.linha_id = l.id WHERE l.company_id = :c AND (l.codigo {$like} :q0 OR l.nome {$like} :q1 OR l.bairro {$like} :q2 OR l.origem {$like} :q3 OR l.destino {$like} :q4) GROUP BY l.id ORDER BY l.codigo");
                $stmt->execute([':c' => $u['company_id'], ':q0' => "%{$q}%", ':q1' => "%{$q}%", ':q2' => "%{$q}%", ':q3' => "%{$q}%", ':q4' => "%{$q}%"]);
            } else {
                $stmt = $pdo->prepare("SELECT l.*, {$agg} AS horarios FROM linhas l LEFT JOIN horarios h ON h.linha_id = l.id WHERE l.company_id = :c GROUP BY l.id ORDER BY l.codigo");
                $stmt->execute([':c' => $u['company_id']]);
            }
        } else {

            if ($q !== '') {
                $stmt = $pdo->prepare("SELECT l.*, {$agg} AS horarios FROM linhas l LEFT JOIN horarios h ON h.linha_id = l.id WHERE l.visivel = 1 AND (l.codigo {$like} :q0 OR l.nome {$like} :q1 OR l.bairro {$like} :q2 OR l.origem {$like} :q3 OR l.destino {$like} :q4) GROUP BY l.id ORDER BY l.codigo LIMIT 100");
                $stmt->execute([':q0' => "%{$q}%", ':q1' => "%{$q}%", ':q2' => "%{$q}%", ':q3' => "%{$q}%", ':q4' => "%{$q}%"]);
            } else {
                $stmt = $pdo->query("SELECT l.*, {$agg} AS horarios FROM linhas l LEFT JOIN horarios h ON h.linha_id = l.id WHERE l.visivel = 1 GROUP BY l.id ORDER BY l.codigo LIMIT 100");
            }
        }
        $rows = $stmt->fetchAll();
        foreach ($rows as &$r) {
            $r['horarios'] = $r['horarios'] ? explode(',', $r['horarios']) : [];
            $r['id'] = (int)$r['id'];

            $p = $pdo->prepare('SELECT ordem, nome, latitude, longitude, tipo FROM pontos WHERE linha_id = :id ORDER BY ordem');
            $p->execute([':id' => $r['id']]);
            $r['pontos'] = $p->fetchAll();
        }
        Response::json(['data' => $rows]);
    }

    public function show(string $id): void
    {
        $pdo = Database::pdo();
        $u = Session::user();
        $sql = 'SELECT l.*, ' . Database::horariosAgg() . ' AS horarios FROM linhas l LEFT JOIN horarios h ON h.linha_id = l.id WHERE l.id = :id GROUP BY l.id';
        $stmt = $pdo->prepare($sql);
        $stmt->execute([':id' => $id]);
        $r = $stmt->fetch();
        if (!$r) {
            Response::error('Linha não encontrada.', 404);
        }
        if (!$u && !(int)$r['visivel']) {
            Response::error('Linha não encontrada.', 404);
        }
        if ($u && (int)$r['company_id'] !== (int)$u['company_id']) {
            Response::error('Sem permissão.', 403);
        }
        $r['horarios'] = $r['horarios'] ? explode(',', $r['horarios']) : [];
        $p = $pdo->prepare('SELECT * FROM pontos WHERE linha_id = :id ORDER BY ordem');
        $p->execute([':id' => $id]);
        $r['pontos'] = $p->fetchAll();
        Response::json(['data' => $r]);
    }

    public function store(): void
    {
        $u = Session::requireAuth();
        $b = Validator::body();
        $codigo = Validator::str($b['codigo'] ?? null, 1, 20);
        $nome = Validator::str($b['nome'] ?? null, 2, 150);
        $bairro = Validator::str($b['bairro'] ?? null, 2, 120);
        $origem = Validator::str($b['origem'] ?? null, 2, 150);
        $destino = Validator::str($b['destino'] ?? null, 2, 150);
        if (!$codigo || !$nome || !$bairro || !$origem || !$destino) {
            Response::error('Campos obrigatórios: codigo, nome, bairro, origem, destino.', 422);
        }
        $pdo = Database::pdo();
        try {
            $stmt = $pdo->prepare('INSERT INTO linhas (company_id, codigo, nome, bairro, origem, destino, visivel) VALUES (:c, :cod, :n, :b, :o, :d, :v)');
            $stmt->execute([':c' => $u['company_id'], ':cod' => $codigo, ':n' => $nome, ':b' => $bairro, ':o' => $origem, ':d' => $destino, ':v' => !empty($b['visivel']) ? 1 : 0]);
            $id = Database::lastId($pdo, 'linhas');
            $this->saveHorarios($pdo, $id, $b['horarios'] ?? '');
        } catch (\PDOException $e) {
            if (str_contains($e->getMessage(), 'uq_linhas')) {
                Response::error('Código já existe nesta empresa.', 409);
            }
            Response::error('Falha ao salvar.', 500);
        }
        Response::json(['message' => 'Linha criada.', 'id' => $id], 201);
    }

    public function update(string $id): void
    {
        $u = Session::requireAuth();
        $pdo = Database::pdo();
        $this->assertOwner($pdo, $u, $id);
        $b = Validator::body();
        $fields = [];
        $params = [':id' => $id];
        foreach (['codigo' => 20, 'nome' => 150, 'bairro' => 120, 'origem' => 150, 'destino' => 150] as $f => $max) {
            if (array_key_exists($f, $b)) {
                $v = Validator::str($b[$f], 1, $max);
                if ($v === null) {
                    Response::error("Campo inválido: {$f}.", 422);
                }
                $fields[] = "{$f} = :{$f}";
                $params[":{$f}"] = $v;
            }
        }
        if (array_key_exists('visivel', $b)) {
            $fields[] = 'visivel = :visivel';
            $params[':visivel'] = !empty($b['visivel']) ? 1 : 0;
        }
        if ($fields) {
            $stmt = $pdo->prepare('UPDATE linhas SET ' . implode(', ', $fields) . ' WHERE id = :id');
            $stmt->execute($params);
        }
        if (array_key_exists('horarios', $b)) {
            $pdo->prepare('DELETE FROM horarios WHERE linha_id = :id')->execute([':id' => $id]);
            $this->saveHorarios($pdo, (int)$id, $b['horarios']);
        }
        Response::json(['message' => 'Linha atualizada.']);
    }

    public function destroy(string $id): void
    {
        $u = Session::requireAuth();
        $pdo = Database::pdo();
        $this->assertOwner($pdo, $u, $id);
        $pdo->prepare('DELETE FROM linhas WHERE id = :id')->execute([':id' => $id]);
        Response::json(['message' => 'Linha excluída.']);
    }

    private function assertOwner(\PDO $pdo, array $u, string $id): array
    {
        $stmt = $pdo->prepare('SELECT * FROM linhas WHERE id = :id');
        $stmt->execute([':id' => $id]);
        $r = $stmt->fetch();
        if (!$r) {
            Response::error('Linha não encontrada.', 404);
        }
        if ((int)$r['company_id'] !== (int)$u['company_id']) {
            Response::error('Sem permissão.', 403);
        }
        return $r;
    }

    private function saveHorarios(\PDO $pdo, int $linhaId, mixed $horarios): void
    {
        $list = is_string($horarios) ? explode(',', $horarios) : (is_array($horarios) ? $horarios : []);
        $ins = $pdo->prepare('INSERT INTO horarios (linha_id, horario) VALUES (:l, :h)');
        foreach ($list as $h) {
            $h = trim((string)$h);
            if (preg_match('/^\d{2}:\d{2}(:\d{2})?$/', $h)) {
                if (strlen($h) === 5) {
                    $h .= ':00';
                }
                $ins->execute([':l' => $linhaId, ':h' => $h]);
            }
        }
    }


    public function pontos(string $id): void
    {
        $pdo = Database::pdo();
        $stmt = $pdo->prepare('SELECT id, visivel, company_id FROM linhas WHERE id = :id');
        $stmt->execute([':id' => $id]);
        $linha = $stmt->fetch();
        if (!$linha) {
            Response::error('Linha não encontrada.', 404);
        }
        $u = Session::user();
        $owner = $u && (int)$u['company_id'] === (int)$linha['company_id'];
        if (!(int)$linha['visivel'] && !$owner) {
            Response::error('Linha não encontrada.', 404);
        }
        $p = $pdo->prepare('SELECT id, ordem, nome, latitude, longitude, tipo FROM pontos WHERE linha_id = :id ORDER BY ordem, id');
        $p->execute([':id' => $id]);
        Response::json(['data' => $p->fetchAll()]);
    }


    public function storePonto(string $id): void
    {
        $u = Session::requireAuth();
        $pdo = Database::pdo();
        $this->assertOwner($pdo, $u, $id);
        $b = Validator::body();
        $nome = Validator::str($b['nome'] ?? null, 2, 150);
        $lat = isset($b['latitude']) ? filter_var($b['latitude'], FILTER_VALIDATE_FLOAT) : false;
        $lng = isset($b['longitude']) ? filter_var($b['longitude'], FILTER_VALIDATE_FLOAT) : false;
        $tipo = $b['tipo'] ?? 'parada';
        if (!$nome) {
            Response::error('Nome do ponto obrigatório (2–150).', 422);
        }
        if ($lat === false || $lat < -90 || $lat > 90) {
            Response::error('Latitude inválida (-90 a 90).', 422);
        }
        if ($lng === false || $lng < -180 || $lng > 180) {
            Response::error('Longitude inválida (-180 a 180).', 422);
        }
        if (!in_array($tipo, ['origem', 'parada', 'destino'], true)) {
            Response::error('Tipo inválido.', 422);
        }
        $max = $pdo->prepare('SELECT COALESCE(MAX(ordem), -1) AS m FROM pontos WHERE linha_id = :id');
        $max->execute([':id' => $id]);
        $ordem = (int)$max->fetch()['m'] + 1;
        $ins = $pdo->prepare('INSERT INTO pontos (linha_id, ordem, nome, latitude, longitude, tipo) VALUES (:l, :o, :n, :la, :lo, :t)');
        $ins->execute([':l' => $id, ':o' => $ordem, ':n' => $nome, ':la' => $lat, ':lo' => $lng, ':t' => $tipo]);
        Response::json(['message' => 'Ponto adicionado.', 'id' => Database::lastId($pdo, 'pontos'), 'ordem' => $ordem], 201);
    }


    public function destroyPonto(string $pid): void
    {
        $u = Session::requireAuth();
        $pdo = Database::pdo();
        $stmt = $pdo->prepare('SELECT p.id, l.company_id FROM pontos p JOIN linhas l ON l.id = p.linha_id WHERE p.id = :pid');
        $stmt->execute([':pid' => $pid]);
        $row = $stmt->fetch();
        if (!$row) {
            Response::error('Ponto não encontrado.', 404);
        }
        if ((int)$row['company_id'] !== (int)$u['company_id']) {
            Response::error('Sem permissão.', 403);
        }
        $pdo->prepare('DELETE FROM pontos WHERE id = :pid')->execute([':pid' => $pid]);
        Response::json(['message' => 'Ponto excluído.']);
    }
}
