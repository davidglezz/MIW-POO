const path = require('path')
const SchemaObjectStore = require('../classes/SchemaObjectStore')
const SchemaReader = require('../classes/SchemaReader')
const SchemaValidator = require('../classes/SchemaValidator')

module.exports = class SchemaController {
  constructor () {
    const filepath = path.join(__dirname, '..', '..', 'schema.jsonld')
    const dbpath = '../data.db'
    this.repository = new SchemaObjectStore(dbpath)
    this.schema = new SchemaReader(filepath)
    this.validator = new SchemaValidator(this.schema)
  }

  getAllTypes () {
    return this.schema.getTypes()
  }

  listTypes () {
    return this.repository.listTypes()
  }

  async create (type, data) {
    let errors = this.validator.validate(data)
    if (errors.length > 0) return { 'error': errors }
    let success = await this.repository.create(type, JSON.stringify(data))
    return success === true ? {success} : {'error': success}
  }

  read (type, id) {
    return this.repository.read(type, id)
  }

  async update (type, id, data) {
    let errors = this.validator.validate(data)
    if (errors.length > 0) return { 'error': errors }
    let success = await this.repository.update(type, id, JSON.stringify(data))
    return success === true ? {success} : {'error': success}
  }

  async delete (id, passwd) {
    if (passwd !== '1234') return { 'error': 'Contraseña incorrecta' }
    let success = await this.repository.delete(id)
    return success === true ? {success} : {'error': success}
  }

  findEntities (type) {
    return this.repository.findEntities(type)
  }
}
