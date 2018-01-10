<?php

namespace POO;

class SchemaApi
{
    protected $schema;
    protected $validator;
    protected $db;

    public function __construct()
    {
        $this->schema = new SchemaReader(dirname(__FILE__) . DIRECTORY_SEPARATOR . 'schema.jsonld');
        $this->validator = new SchemaValidator($this->schema);
        try {
            $this->db = new \PDO('sqlite:../../data.db');
            $this->db->exec("CREATE TABLE IF NOT EXISTS objects (
                        id INTEGER PRIMARY KEY, 
                        type TEXT NOT NULL, 
                        data TEXT NOT NULL)");
        } catch(PDOException  $e) {
            echo $e->getMessage();
        }
    }

    public function getAllTypes()
    {
        return $this->schema->getTypes();
    }

    public function listTypes()
    {
        $sql = "SELECT type, COUNT(*) as num FROM objects GROUP BY type";
        return $this->db->query($sql)->fetchAll(\PDO::FETCH_ASSOC);
    }

    public function create($type, $data)
    {
        $errors = $this->validator->validate($data);
        if (count($errors) > 0) {
            return ['error' => $errors];
        }

        $data = json_encode($data);
        $sql = "INSERT INTO objects (type, data) VALUES ('$type', '$data')";
        return ['success' => $this->db->exec($sql) !== false];
    }

    public function findEntities($type)
    {
        $sql = "SELECT id, LENGTH(data) AS size FROM objects WHERE type = '$type'";
        return $this->db->query($sql)->fetchAll(\PDO::FETCH_ASSOC);
    }

    public function read($type, $id)
    {
        $sql = "SELECT data FROM objects WHERE id = $id AND type = '$type' LIMIT 1";
        return $this->db->query($sql)->fetch(\PDO::FETCH_ASSOC);
    }

    public function update($type, $id, $data)
    {
        $sql = "UPDATE objects SET data = '$data' WHERE id = $id AND type = '$type' LIMIT 1";
        return ['success' => $this->db->exec($sql) !== false];
    }

    public function delete($id)
    {
        return ['success' => $this->db->exec("DELETE FROM objects WHERE id = $id") !== false];
    }
}
