<?php

function autoloadclass($class)
{
    $parts = explode('\\', $class);
    require end($parts) . '.php';
}

spl_autoload_register('autoloadclass');

$schema = new POO\SchemaReader('schema.jsonld');

echo '<pre>';
//var_dump($schema->getSuperClasses('http://schema.org/Person'));//PoliceStation Person
echo '</pre>';

$input = '{
	"@context": "http://schema.org",
	"@type": "Person",
	"name": "Jose Torres",
	"birthData": "1980-03-20",
	"children": {
		"@type": "Person",
		"name": "Ana"
	}
}';

$input = json_decode($input, true);

$validator = new POO\SchemaValidator($schema);

echo '<pre>';
var_dump($validator->validate($input));
echo '</pre>';
