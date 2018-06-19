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
    res.json(await this.controller.listTypes()
      .catch(error => ({
        error
      })))
  }

  async getEntity (req, res) {
    res.json(await this.controller.findEntities(req.params.entity)
      .catch(error => ({
        error
      })))
  }

  async getEntityId (req, res) {
    res.json(await this.controller.read(req.params.entity, req.params.id)
      .catch(error => ({
        error
      })))
  }

  async postEntity (req, res) {
    res.json(await this.controller.create(req.params.entity, req.body)
      .catch(error => ({
        error
      })))
  }

  async putEntityId (req, res) {
    res.json(await this.controller.update(req.params.entity, req.params.id, req.body)
      .catch(error => ({
        error
      })))
  }

  async deleteEntityId (req, res) {
    res.json(await this.controller.delete(req.params.id)
      .catch(error => ({
        error
      })))
  }
}
