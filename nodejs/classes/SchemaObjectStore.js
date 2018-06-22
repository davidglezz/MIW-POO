const sqlite3 = require('sqlite3').verbose()

module.exports = class SchemaObjectStore {
  constructor (dbpath) {
    this.db = new sqlite3.Database(dbpath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
      if (err) {
        return console.error(err.message)
      }
      this.db.run('CREATE TABLE IF NOT EXISTS objects (id INTEGER PRIMARY KEY, type TEXT NOT NULL, data TEXT NOT NULL)')
    })
  }

  async create (type, data) {
    const sql = 'INSERT INTO objects (type, data) VALUES (?, ?)'
    return new Promise((resolve, reject) => {
      this.db.run(sql, [type, data], (err, data) => resolve(err ? err.code : data))
    })
  }

  async read (type, id) {
    const sql = 'SELECT data FROM objects WHERE type = ? AND id = ? LIMIT 1'
    return new Promise((resolve, reject) => {
      this.db.get(sql, [type, id], (err, data) => resolve(err ? err.code : data))
    })
  }

  async update (type, id, data) {
    console.log(id, data)
    const sql = 'UPDATE objects SET data = ? WHERE id = ?'
    return new Promise((resolve, reject) => {
      this.db.run(sql, [data, id], (err, data) => resolve(err ? err.code : true))
    })
  }

  async delete (id) {
    const sql = 'DELETE FROM objects WHERE id = ?'
    return new Promise((resolve, reject) => {
      this.db.run(sql, [id], (err, data) => resolve(err ? err.code : true))
    })
  }

  async listTypes () {
    const sql = 'SELECT type, COUNT(*) as num FROM objects GROUP BY type'
    return new Promise((resolve, reject) => {
      this.db.all(sql, [], (err, rows) => resolve(err ? err.code : rows))
    })
  }

  async findEntities (type) {
    const sql = 'SELECT id, LENGTH(data) AS size FROM objects WHERE type = ?'
    return new Promise((resolve, reject) => {
      this.db.all(sql, [type], (err, rows) => resolve(err ? err.code : rows))
    })
  }

  dispose () {
    this.db.close(err => {
      if (err) {
        console.error(err.message)
      }
    })
  }
}
