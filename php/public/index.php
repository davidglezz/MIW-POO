<?php
use \Psr\Http\Message\ServerRequestInterface as Request;
use \Psr\Http\Message\ResponseInterface as Response;

require '../vendor/autoload.php';

$app = new \Slim\App;

$schema = new POO\SchemaReader('schema/schema.jsonld');
$validator = new POO\SchemaValidator($schema);

$app->get('/', function (Request $request, Response $response, array $args) {

    return $response->withJSON(
        $schema->getTypes(),
        200,
        JSON_UNESCAPED_UNICODE
    );
});

$app->get('/hello/{name}', function (Request $request, Response $response, array $args) {
    $name = $args['name'];
    $response->getBody()->write("Hello, $name");

    return $response;
});
$app->run();
