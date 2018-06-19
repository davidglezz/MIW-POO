const url = require('url')

module.exports = class SchemaValidator {
  constructor (schema) {
    this.schema = schema
    this.validators = {
      'rdfs:Class': value => {
        return true
      },
      'http://schema.org/Date': value => {
        try {
          return (new Date(value)).toISOString().substring(0, 11).includes(value)
        } catch (err) {
          return false
        }
      },
      'http://schema.org/Time': value => {
        try {
          return (new Date(value)).toISOString().substring(11).includes(value)
        } catch (err) {
          return false
        }
      },
      'http://schema.org/Number': value => {
        return this.validators['http://schema.org/Integer'](value) ||
          this.validators['http://schema.org/Float'](value)
      },
      'http://schema.org/Integer': value => {
        return Number.isInteger(+value) && parseInt(value).toString() === value.toString()
      },
      'http://schema.org/Float': value => {
        return !isNaN(value)
      },
      'http://schema.org/Text': value => {
        return true
      },
      'http://schema.org/URL': value => {
        try {
          url.parse(value)
          return true
        } catch (err) {
          return false
        }
      },
      'http://schema.org/Boolean': value => {
        return this.validators['http://schema.org/False'](value) ||
          this.validators['http://schema.org/True'](value)
      },
      'http://schema.org/False': value => {
        return value === 'False' || value === 'http://schema.org/False'
      },
      'http://schema.org/True': value => {
        return value === 'True' || value === 'http://schema.org/True'
      },
      'http://schema.org/DateTime': value => {
        try {
          return (new Date(value)).toISOString() === value
        } catch (err) {
          return false
        }
      }
    }
  }

  validateValue (key, value, context) {
    let prop = this.schema.get(context + key)
    let valueTypeErrors = []
    for (let valueTypeId of this.getArray(prop['http://schema.org/rangeIncludes'])) {
      let valueType = this.schema.get(valueTypeId)
      if (Array.isArray(valueType['@type']) && valueType['@type'].includes('http://schema.org/DataType')) {
        if (typeof value !== 'string') {
          valueTypeErrors.push(`DataType '${key}' is not string.`)
        } if (this.validators[valueTypeId](value)) {
          break
        } else {
          valueTypeErrors.push(`'${key}' is not valid valueTypeId.`)
        }
      } else { // TODO Se asume class, verificar
        let result = []
        if (typeof value === 'object') {
          result = this.validate(value, context)
        } else {
          // result[] = "Key 'key' is not array.";
          // result = []
        }

        if (result.length === 0) {
          break
        }

        valueTypeErrors = [...valueTypeErrors, ...result]
      }
    }
    return valueTypeErrors
  }

  validate (obj, context = '') {
    // Type
    if (!obj['@type']) return ['@type not found on input object.']
    let type = obj['@type']

    // Context
    context = obj['@context'] || context
    if (context && context[context.length - 1] === '/') {
      context += '/'
    }

    // Type + Inheritance
    let classes = this.schema.getSuperClasses(context + type)
    if (classes.length === 0) {
      return [`Type '${type}' not found in schema.`]
    }

    // Properties
    let errors = []
    for (let [key, value] of Object.entries(obj)) {
      if (key[0] === '@') continue // ignore @..

      let prop = this.schema.get(context.key)
      if (!prop || prop['@type'] !== 'rdf:Property') {
        errors.push(`Property '${key}' not found in schema.`)
        continue
      }
      // Its defined in the type/shape.
      let propertyClasses = this.getArray(prop['http://schema.org/domainIncludes'])
      if (classes.filter(v => propertyClasses.indexOf(v) !== -1).length === 0) { // Intersection
        errors.push(`Property '${key}' not found in 'type'.`)
        continue
      }
      // Validate property value
      let propertyErrors = this.validateValue(key, value, context)
      if (propertyErrors.length) {
        errors = [...errors, `Property '${key}' not valid.`, ...propertyErrors]
      }
    }
    return errors
  }

  /**
   * A veces es un valor, otras veces un array de valores
   */
  getArray (obj) {
    return !obj['@id'] ? obj.map(e => e['@id']) : [obj['@id']]
  }

  // TODO Alias "@type": "http://id..."
  // TODO Enumeration subtypes
  // TODO supersededBy . Relates a term (i.e. a property, class or enumeration) to one that supersedes it.
  // TODO rdfs:subPropertyOf
}
