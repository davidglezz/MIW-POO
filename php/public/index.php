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
            ->withHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept, Origin, Authorization')
            ->withHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
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

$app->get('/{entidad}', function (Request $request, Response $response, array $args) use ($api) {
    return $response->withJSON(
        $api->findEntities($args['entidad']),
        200,
        JSON_UNESCAPED_UNICODE
    );
});

$app->get('/{entidad}/{id}', function (Request $request, Response $response, array $args) use ($api) {
    return $response->withJSON(
        $api->read($args['entidad'], $args['id']),
        200,
        JSON_UNESCAPED_UNICODE
    );
});

$app->post('/{entidad}', function (Request $request, Response $response, array $args) use ($api) {
    return $response->withJSON(
        $api->create($args['entidad'], $request->getParsedBody()),
        200,
        JSON_UNESCAPED_UNICODE
    );
});

$app->put('/{entidad}/{id}', function (Request $request, Response $response, array $args) use ($api) {
    return $response->withJSON(
        $api->update($args['entidad'], $request->getParsedBody()),
        200,
        JSON_UNESCAPED_UNICODE
    );
});

$app->delete('/{entidad}/{id}', function (Request $request, Response $response, array $args) use ($api) {
    return $response->withJSON(
        $api->delete($args['id']),
        200,
        JSON_UNESCAPED_UNICODE
    );
});

$app->run();
