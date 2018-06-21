import isodate
import validators


class SchemaValidator:
    def __init__(self, schema):
        self.schema = schema
        # self.validators[name]()
        self.validators = {
            'rdfs:Class': self.validate_Class,
            'rdf:Property': self.validate_Property,
            'http://schema.org/DateTime': self.validate_DateTime,
            'http://schema.org/Date': self.validate_Date,
            'http://schema.org/Time': self.validate_Time,
            'http://schema.org/Number': self.validate_Number,
            'http://schema.org/Integer': self.validate_Integer,
            'http://schema.org/Float': self.validate_Float,
            'http://schema.org/Text': self.validate_Text,
            'http://schema.org/URL': self.validate_URL,
            'http://schema.org/Boolean': self.validate_Boolean,
            'http://schema.org/False': self.validate_False,
            'http://schema.org/True': self.validate_True,
        }

    def validate(self, obj, context=''):
        print(obj)
        result = self.validators['rdfs:Class'](obj, context)
        print(result)
        return result

    def validate_Class(self, obj, context=''):
        print('rdfs:Class', obj)
        # Type
        if '@type' not in obj:
            return ['@type not found on input object.']
        type = obj['@type']

        # Context
        context = obj.get('@context', context)
        if len(context) > 0 and context[-1] != '/':
            context += '/'

        # Exist in the vocabulary?
        klass = self.schema.get(context + type)
        if klass is None or klass.get('@type') != 'rdfs:Class':
            return [f"Type '{type}' not found in the vocabulary."]

        # Properties
        errors = []
        for id, value in obj.items():
            if id[0] == '@': continue  # ignore @..
            propertyErrors = self.validators['rdf:Property'](id, value, context, type)
            if len(propertyErrors):
                errors += propertyErrors
        return errors

    def validate_Property(self, id, value, context, type):
        print('rdf:Property', id)
        # Is there property in the vocabulary?
        prop = self.schema.get(context + id)
        if prop is None or prop.get('@type') != 'rdf:Property':
            return [f"Property '{id}' not found in vocabulary."]

        # Does the property belong to the class / type / shape + Inheritance(in Parents)?
        classes = self.schema.getSuperClasses(context + type)
        propertyClasses = self.getArray(prop.get('http://schema.org/domainIncludes'))
        if len([e for e in classes if e in propertyClasses]) > 0: # Intersection
            return [f"Property '{id}' not found in 'type'."]

        # Validate property value
        def propertyValueValidator(val, i=-1):
            propName = f"{id}[{i}]" if i >= 0 else id
            isValid = False
            errors = []
            for valueTypeId in self.getArray(prop['http://schema.org/rangeIncludes']):
                validator = valueTypeId if isinstance(val, str) else 'rdfs:Class'
                if validator not in self.validators:
                    errors.append(f"Type '{propName}' can't be validated due to input data type.")
                    break

                result = self.validators[validator](val, context)
                if result == True or len(result) == 0:
                    isValid = True
                    break

                # TODO All validators must return list of errors instead of boolean
                if isinstance(result, list):
                    errors.extend(result)

            if not isValid:
                return [f"Property '{propName}' not valid because:", errors]

            return [] # All ok, return 0 errors

        if isinstance(value, list):  # when an array is valid value?
            errors = []
            for e in value: errors.extend(propertyValueValidator(value))
            return errors
        else:
            return propertyValueValidator(value)

    def validate_DateTime(self, value, context=''):
        try:
            isodate.parse_datetime(value)
            return True
        except:
            return False

    def validate_Date(self, value, context=''):
        try:
            isodate.parse_date(value)
            return True
        except:
            return False

    def validate_Time(self, value, context=''):
        try:
            isodate.parse_time(value)
            return True
        except:
            return False

    def validate_Number(self, value, context=''):
        return self.validators['http://schema.org/Integer'](value) or self.validators['http://schema.org/Float'](value)

    def validate_Integer(self, value, context=''):
        try:
            int(value)
            return True
        except:
            return False

    def validate_Float(self, value, context=''):
        try:
            float(value)
            return True
        except:
            return False

    def validate_Text(self, value, context=''):
        return True

    def validate_URL(self, value, context=''):
        try:
            validators.url(value)
            return True
        except:
            return False

    def validate_Boolean(self, value, context=''):
        return self.validators['http://schema.org/False'](value) or self.validators['http://schema.org/True'](value)

    def validate_False(self, value, context=''):
        return value == 'False' or value == 'http://schema.org/False'

    def validate_True(self, value, context=''):
        return value == 'True' or value == 'http://schema.org/True'

    def getArray(self, obj):
        return [obj['@id']] if '@id' in obj else [e['@id'] for e in obj]
    
