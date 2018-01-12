from flask_restful import reqparse, abort, Resource
from SchemaRepository import SchemaRepository

parser = reqparse.RequestParser()
parser.add_argument('data')

class SchemaList(Resource):
    def __init__(self):
        self.repo = SchemaRepository()

    def get(self):
        return self.repo.listEntities()


class SchemaEntity(Resource):
    def __init__(self):
        self.repo = SchemaRepository()

    def get(self, entity):
        return self.repo.listEntityObjects(entity)

    def post(self, entity):
        args = parser.parse_args()
        data = args['data']
        # TODO validate
        return self.repo.create(entity, data)


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
#def abort_if_todo_doesnt_exist(todo_id):
#    if todo_id not in TODOS:
#        abort(404, message="Todo {} doesn't exist".format(todo_id))
