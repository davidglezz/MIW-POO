<?php

namespace POO;

class SchemaReader
{
    protected $graph;

    public function __construct(string $path)
    {
        $jsonldSchema = file_get_contents($path);
        $data = json_decode($jsonldSchema, true);

        if ($data === null) {
            throw new Exception('Json decode error: 0x' . json_last_error() . ' - ' . json_last_error_msg());
        }

        if (!array_key_exists('@graph', $data)) {
            throw new Exception('Invalid input data. @graph not found.');
        }

        // indexing by @id
        $this->graph = array_combine(array_column($data['@graph'], '@id'), $data['@graph']);
    }

    function get(string $id)
    {
        return isset($this->graph[$id]) ? $this->graph[$id] : null;
    }

    function getSuperClasses(string $id)
    {
        $class = $this->get($id);
        
        if ($class === null || !array_key_exists('@type', $class) || $class['@type'] !== 'rdfs:Class') {
            return [];
        }

        $classes = [$id];

        // zero parents
        if (!array_key_exists('rdfs:subClassOf', $class)) {
            return $classes;
        }

        // one parent
        if (array_key_exists('@id', $class['rdfs:subClassOf'])) {
            $superSuper = $this->getSuperClasses($class['rdfs:subClassOf']['@id']);
            return array_merge($classes, $superSuper);
        }

        // multiple parents
        foreach ($class['rdfs:subClassOf'] as $superClass) {
            $superSuper = $this->getSuperClasses($superClass['@id']);
            $classes = array_merge($classes, $superSuper);
        }
        return array_unique($classes);
    }
}