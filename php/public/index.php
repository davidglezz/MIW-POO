<?php
use \Psr\Http\Message\ServerRequestInterface as Request;
use \Psr\Http\Message\ResponseInterface as Response;

require '../vendor/autoload.php';

$app = new \Slim\App;
$api = new POO\SchemaApi();

$app->add(function ($req, $res, $next) {
    $response = $next($req, $res);
    return $response
            ->withHeader('Access-Control-Allow-Origin', '*')
            ->withHeader('Access-Control-Allow-Headers', '*')
            ->withHeader('Access-Control-Allow-Methods', '*');
});

$app->options('/{routes:.+}', function ($request, $response, $args) {
    return $response;
});

$app->get('/', function (Request $request, Response $response, array $args) use ($api) {
    return $response->withJSON(
        $request->getQueryParam('all') === null ? $api->listTypes() : $api->getAllTypes(),
        200,
        JSON_UNESCAPED_UNICODE
    );
});

$app->get('/{entity}', function (Request $request, Response $response, array $args) use ($api) {
    return $response->withJSON(
        $api->findEntities($args['entity']),
        200,
        JSON_UNESCAPED_UNICODE
    );
});

$app->get('/{entity}/{id}', function (Request $request, Response $response, array $args) use ($api) {
    return $response->withJSON(
        $api->read($args['entity'], $args['id']),
        200,
        JSON_UNESCAPED_UNICODE
    );
});

$app->post('/{entity}', function (Request $request, Response $response, array $args) use ($api) {
    return $response->withJSON(
        $api->create($args['entity'], $request->getParsedBody()),
        200,
        JSON_UNESCAPED_UNICODE
    );
});

$app->put('/{entity}/{id}', function (Request $request, Response $response, array $args) use ($api) {
    return $response->withJSON(
        $api->update($args['entity'], $args['id'], $request->getParsedBody()),
        200,
        JSON_UNESCAPED_UNICODE
    );
});

$app->delete('/{entity}/{id}', function (Request $request, Response $response, array $args) use ($api) {
    return $response->withJSON(
        $api->delete($args['id']),
        200,
        JSON_UNESCAPED_UNICODE
    );
});

$app->run();
