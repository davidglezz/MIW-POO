import sqlite3


class SchemaRepository(object):
    __instance = None
    def __new__(cls):
        if SchemaRepository.__instance is None:
            SchemaRepository.__instance = object.__new__(cls)
            cls.__instance.__initialized = False
        return SchemaRepository.__instance

    def __init__(self):
        if(self.__initialized):
            return
        self.__initialized = True
        self.con = sqlite3.connect('../data.db')
        self.con.row_factory = dict_factory
        self.c = self.con.cursor()
        sql = 'CREATE TABLE IF NOT EXISTS objects (id INTEGER PRIMARY KEY, type TEXT NOT NULL, data TEXT NOT NULL)'
        self.c.execute(sql)

    def create(self, entity, data):
        sql = 'INSERT INTO objects (type, data) VALUES (?, ?)'
        return self.c.execute(sql, (entity, data))

    def read(self, entity, id):
        sql = 'SELECT data FROM objects WHERE type = ? AND id = ? LIMIT 1'
        self.c.execute(sql, (entity, id))
        return self.c.fetchone()

    def update(self, entity, id, data):
        sql = 'UPDATE objects SET data = ? WHERE id = ? AND type = ? LIMIT 1'
        return self.c.execute(sql, (data, id, entity))

    def delete(self, entity, id):
        sql = 'DELETE FROM objects WHERE id = ? AND type = ?'
        return self.c.execute(sql, (id, entity))

    def listEntities(self):
        sql = 'SELECT type, COUNT(*) as num FROM objects GROUP BY type'
        self.c.execute(sql)
        return self.c.fetchall()

    def listEntityObjects(self, entity):
        sql = 'SELECT id, LENGTH(data) AS size FROM objects WHERE type = ?'
        self.c.execute(sql, (entity,))
        return self.c.fetchall()


def dict_factory(cursor, row):
    d = {}
    for idx, col in enumerate(cursor.description):
        d[col[0]] = row[idx]
    return d
