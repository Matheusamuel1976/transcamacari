<?php

declare(strict_types=1);

use App\Controllers\AccessController;
use App\Controllers\AuthController;
use App\Controllers\ContatoController;
use App\Controllers\FuncionarioController;
use App\Controllers\LinhaController;
use App\Core\Response;
use App\Core\Session;

require __DIR__ . '/../config/bootstrap.php';

$method = $_SERVER['REQUEST_METHOD'];
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?: '/';
$uri = rtrim($uri, '/') ?: '/';

function route_match(string $pattern, string $uri, array &$params = []): bool
{
    $regex = '#^' . preg_replace('#\{(\w+)\}#', '(?P<$1>[^/]+)', $pattern) . '$#';
    if (preg_match($regex, $uri, $m)) {
        foreach ($m as $k => $v) {
            if (is_string($k)) {
                $params[$k] = $v;
            }
        }
        return true;
    }
    return false;
}


if ($method === 'OPTIONS') {
    http_response_code(204);
    exit;
}



if (in_array($method, ['POST', 'PUT', 'DELETE'], true)
    && $uri !== '/auth/login'
    && $uri !== '/auth/register'
) {
    Session::checkCsrf();
}

$p = [];


if ($uri === '/auth/register' && $method === 'POST') {
    (new AuthController())->register();
}
if ($uri === '/auth/login' && $method === 'POST') {
    (new AuthController())->login();
}
if ($uri === '/auth/logout' && $method === 'POST') {
    (new AuthController())->logout();
}
if ($uri === '/auth/me' && $method === 'GET') {
    (new AuthController())->me();
}
if ($uri === '/auth/profile' && $method === 'PUT') {
    (new AuthController())->profile();
}
if ($uri === '/auth/csrf' && $method === 'GET') {
    Response::json(['csrf' => Session::csrfToken()]);
}


if (route_match('/linhas/{id}/pontos', $uri, $p) && $method === 'GET') {
    (new LinhaController())->pontos($p['id']);
}
if (route_match('/linhas/{id}/pontos', $uri, $p) && $method === 'POST') {
    (new LinhaController())->storePonto($p['id']);
}
if (route_match('/pontos/{pid}', $uri, $p) && $method === 'DELETE') {
    (new LinhaController())->destroyPonto($p['pid']);
}


if ($uri === '/linhas' && $method === 'GET') {
    (new LinhaController())->index();
}
if ($uri === '/linhas' && $method === 'POST') {
    (new LinhaController())->store();
}
if (route_match('/linhas/{id}', $uri, $p) && $method === 'GET') {
    (new LinhaController())->show($p['id']);
}
if (route_match('/linhas/{id}', $uri, $p) && $method === 'PUT') {
    (new LinhaController())->update($p['id']);
}
if (route_match('/linhas/{id}', $uri, $p) && $method === 'DELETE') {
    (new LinhaController())->destroy($p['id']);
}


if ($uri === '/funcionarios' && $method === 'GET') {
    (new FuncionarioController())->index();
}
if ($uri === '/funcionarios' && $method === 'POST') {
    (new FuncionarioController())->store();
}
if (route_match('/funcionarios/{id}', $uri, $p) && $method === 'PUT') {
    (new FuncionarioController())->update($p['id']);
}
if (route_match('/funcionarios/{id}', $uri, $p) && $method === 'DELETE') {
    (new FuncionarioController())->destroy($p['id']);
}


if ($uri === '/contato' && $method === 'POST') {
    (new ContatoController())->store();
}


if ($uri === '/team/invite-code' && $method === 'GET') {
    (new AccessController())->inviteCode();
}
if ($uri === '/team/invite-code' && $method === 'POST') {
    (new AccessController())->regenerateCode();
}
if ($uri === '/team/users' && $method === 'GET') {
    (new AccessController())->teamUsers();
}
if ($uri === '/team/users' && $method === 'POST') {
    (new AccessController())->createUser();
}
if ($uri === '/team/pending' && $method === 'GET') {
    (new AccessController())->pending();
}
if (route_match('/team/users/{id}/approve', $uri, $p) && $method === 'POST') {
    (new AccessController())->approve($p['id']);
}
if (route_match('/team/users/{id}/lines', $uri, $p) && $method === 'PUT') {
    (new AccessController())->assign($p['id']);
}
if (route_match('/team/users/{id}', $uri, $p) && $method === 'DELETE') {
    (new AccessController())->remove($p['id']);
}


if ($uri === '/health' && $method === 'GET') {
    Response::json(['status' => 'ok', 'app' => 'TransCamaçari 2.0']);
}

Session::start();
Response::error('Rota não encontrada.', 404);
