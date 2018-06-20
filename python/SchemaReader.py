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

        self.graph = dict(zip([e.get('@id') for e in data], data))

    def get(self, id):
        return self.graph[id] if id in self.graph else False

    def getSuperClasses(self, id):
        klass = self.graph[id] if id in self.graph else False

        if not klass or '@type' not in klass or klass['@type'] != 'rdfs:Class'
            return list()

        classes = list(id)

        # zero parents
        if 'rdfs:subClassOf' not in klass
            return classes

        # one parent
        if '@id' in klass['rdfs:subClassOf']
            superSuper = self.getSuperClasses(klass['rdfs:subClassOf']['@id'])
            return list(set(classes + superSuper))

        # multiple parents
        for key, superClass in klass['rdfs:subClassOf'].items():
            classes += self.getSuperClasses(superClass['@id'])

        return list(set(classes)

    def getTypes(self, id):
        return [e for e in self.graph.values() if e['@type'] == 'rdfs:Class']
        # return list(filter(lambda e: e['@type'] == 'rdfs:Class', self.graph.values()))
