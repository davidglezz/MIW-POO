from flask import Flask
from flask_restful import Api
from SchemaApiController import SchemaList, SchemaEntity, SchemaObject

app = Flask(__name__)
api = Api(app)

## Actually setup the Api resource routing here
api.add_resource(SchemaList, '/')
api.add_resource(SchemaEntity, '/<entity>')
api.add_resource(SchemaObject, '/<entity>/<id>')

if __name__ == '__main__':
    app.run(debug=True)
