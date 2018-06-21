from flask import Flask
from flask_restful import Api
from flask_cors import CORS
from SchemaApiController import SchemaList, SchemaEntity, SchemaObject

app = Flask(__name__)
api = Api(app)
CORS(app)

# Actually setup the Api resource routing here
api.add_resource(SchemaList, '/')
api.add_resource(SchemaEntity, '/<entity>')
api.add_resource(SchemaObject, '/<entity>/<id>')

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=8003)
