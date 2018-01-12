import json

class SchemaList:
    def __init__(self):
        try:
            with open('../schema.jsonld', 'r') as f:
                data = json.load(f)
        except ValueError:
            raise ValueError('Decoding JSON has failed')

        if '@graph' not in data:
            raise ValueError('Invalid input data. @graph not found.')
        
        self.graph = data

    def get(self, id):
        self.graph[id] if id not in self.graph else False

    def getSuperClasses(self, id):
        # TODO

    def getTypes(self, id):
        # TODO




