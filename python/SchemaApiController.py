from flask import request
from flask_restful import reqparse, abort, Resource
from SchemaRepository import SchemaRepository
from SchemaReader import SchemaReader
from SchemaValidator import SchemaValidator
import json

parser = reqparse.RequestParser()
parser.add_argument('data')

#repository = SchemaRepository()
reader = SchemaReader('../schema.jsonld')
validator = SchemaValidator(reader)


class SchemaList(Resource):
    def __init__(self):
        self.repo = SchemaRepository()

    def get(self):
        return self.repo.listEntities()


class SchemaEntity(Resource):
    def __init__(self):
        self.repo = SchemaRepository()
        self.validator = validator

    def get(self, entity):
        return self.repo.listEntityObjects(entity)

    def post(self, entity):
        data = request.json
        errors = self.validator.validate(data, '')
        if len(errors) > 0:
            return {'error': errors}
        #self.repo.create(entity, json.dumps(dict(data)))
        return {'success': '1'}


class SchemaObject(Resource):
    def __init__(self):
        self.repo = SchemaRepository()

    def get(self, entity, id):
        return self.repo.read(entity, id)

    def put(self, entity, id):
        args = parser.parse_args()
        data = args['data']
        # TODO validate
        return self.repo.update(entity, id, data)

    def delete(self, entity, id):
        return self.repo.delete(entity, id)


# - Ejemplo para errores
# def abort_if_todo_doesnt_exist(todo_id):
#    if todo_id not in TODOS:
#        abort(404, message="Todo {} doesn't exist".format(todo_id))
