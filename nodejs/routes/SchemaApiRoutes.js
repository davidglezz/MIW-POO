const express = require('express')
const SchemaController = require('../controllers/SchemaController')

module.exports = class SchemaApiRoutes {
  constructor () {
    this.controller = new SchemaController()
    this.router = express.Router()
    this.router.get('/', this.getMain.bind(this))
    this.router.get('/:entity', this.getEntity.bind(this))
    this.router.get('/:entity/:id', this.getEntityId.bind(this))
    this.router.post('/:entity', this.postEntity.bind(this))
    this.router.put('/:entity/:id', this.putEntityId.bind(this))
    this.router.delete('/:entity/:id', this.deleteEntityId.bind(this))
  }

  getRouter () {
    return this.router
  }

  async getMain (req, res) {
    res.json(await this.controller.listTypes().catch(error => ({ error })))
  }

  async getEntity (req, res) {
    res.json(await this.controller.findEntities(req.params.entity).catch(error => ({ error })))
  }

  async getEntityId (req, res) {
    res.json(await this.controller.read(req.params.entity, req.params.id).catch(error => ({ error })))
  }

  async postEntity (req, res) {

  }

  async putEntityId (req, res) {

  }

  async deleteEntityId (req, res) {

  }
}
