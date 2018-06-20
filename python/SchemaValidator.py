import isodate
import validators

class SchemaList:
    def __init__(self):
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
        result = self.validators['rdfs:Class'](obj, context)
        print(result)
        return result

    def validate_Class(self, obj, context=''):
        return True

    def validate_Property(self, value):
        return True

    def validate_DateTime(self, value):
        try:
            isodate.parse_datetime(value)
            return True
        except:
            return False

    def validate_Date(self, value):
        try:
            isodate.parse_date(value)
            return True
        except:
            return False

    def validate_Time(self, value):
        try:
            isodate.parse_time(value)
            return True
        except:
            return False

    def validate_Number(self, value):
        return self.validators['http://schema.org/Integer'](value) or
          self.validators['http://schema.org/Float'](value)

    def validate_Integer(self, value):
        try:
            int(value)
            return True
        except ValueError:
            return False

    def validate_Float(self, value):
        # https://stackoverflow.com/questions/736043
        try:
            float(value)
            return True
        except ValueError:
            return False

    def validate_Text(self, value):
        return True

    def validate_URL(self, value):
        return validators.url(value)

    def validate_Boolean(self, value):
        return self.validators['http://schema.org/False'](value) or
          self.validators['http://schema.org/True'](value)

    def validate_False(self, value):
        return value == 'False' or value == 'http://schema.org/False'

    def validate_True(self, value):
        return value == 'True' or value == 'http://schema.org/True'
