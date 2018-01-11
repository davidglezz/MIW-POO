const SchemaObjectStore = require('../classes/SchemaObjectStore')
const SchemaReader = require('../classes/SchemaReader')
const SchemaValidator = require('../classes/SchemaValidator')

module.exports = class SchemaController {
  constructor () {
    this.repository = new SchemaObjectStore()
    this.schema = new SchemaReader()
    this.validator = new SchemaValidator()
  }

  getAllTypes () {
    return this.schema.getTypes()
  }

  listTypes () {
    return this.repository.listTypes()
  }

  create (type, data) {
    return this.repository.create(type, data)
  }

  read (type, id) {
    return this.repository.read(type, id)
  }

  update (type, id, data) {
    return this.repository.update(type, id, data)
  }

  delete (id) {
    return this.repository.delete(id)
  }

  findEntities (type) {
    return this.repository.findEntities(type)
  }
}
