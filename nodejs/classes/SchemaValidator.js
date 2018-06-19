const url = require('url')

module.exports = class SchemaValidator {
  constructor (schema) {
    this.schema = schema

    this.validators = {
      'rdfs:Class': (obj, context = '') => {
        // Type
        if (!obj['@type']) return ['@type not found on input object.']
        let type = obj['@type']

        // Context
        context = obj['@context'] || context
        if (context && context[context.length - 1] !== '/') {
          context += '/'
        }

        // Exist in the vocabulary?
        let klass = this.schema.get(context + type)
        if (!klass || klass['@type'] !== 'rdfs:Class') {
          return [`Type '${type}' not found in the vocabulary.`]
        }

        // Properties
        let errors = []
        for (let [id, value] of Object.entries(obj)) {
          if (id[0] !== '@') { // ignore @..
            const propertyErrors = this.validators['rdf:Property'](id, value, context, type)
            if (propertyErrors.length) {
              errors = [...errors, ...propertyErrors]
            }
          }
        }
        return errors
      },
      'rdf:Property': (id, value, context, type) => {
        // Is there property in the vocabulary?
        let prop = this.schema.get(context + id)
        if (!prop || prop['@type'] !== 'rdf:Property') {
          return [`Property '${id}' not found in vocabulary.`]
        }

        // Does the property belong to the class/type/shape + Inheritance (Parents)?
        let classes = this.schema.getSuperClasses(context + type)
        let propertyClasses = this.getArray(prop['http://schema.org/domainIncludes'])
        if (classes.filter(v => propertyClasses.indexOf(v) !== -1).length === 0) { // Intersection
          return [`Property '${id}' not found in 'type'.`]
        }

        // Validate property value
        let isValid = false
        let errors = []
        for (let valueTypeId of this.getArray(prop['http://schema.org/rangeIncludes'])) {
          let valueType = this.schema.get(valueTypeId)
          let types = typeof valueType['@type'] === 'string' ? [valueType['@type']] : valueType['@type']
          let validator

          // Select validator according to type
          if (types.includes('http://schema.org/DataType')) { // Basic data types
            if (typeof value === 'string') validator = valueTypeId
          } else if (types.includes('rdfs:Class')) {
            validator = 'rdfs:Class'
          } else {
            // Type -> ID (Alias)
            validator = 'rdfs:Class'
          }

          if (!validator) {
            errors.push(`Type '${id}' can't be validated due to input data type.`)
          }

          let result = this.validators[validator](value, context)
          if (result === true || result.length === 0) {
            isValid = true
          } else {
            errors = [...errors, ...result]
          }
        }

        if (!isValid) {
          return [`Property '${id}' not valid.`, errors]
        }

        return [] // All ok, return 0 errors
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

  validate(obj, context = '') {
    let result = this.validators['rdfs:Class'](obj, context)
    console.log(result)
    return result
  }

  /**
   * A veces es un valor, otras veces un array de valores
   */
  getArray (obj) {
    return !obj['@id'] ? obj.map(e => e['@id']) : [obj['@id']]
  }

  test () {
    let test = Object.values(this.schema.graph)
      .filter(e => !Object.keys(this.validators).includes(e['@type']))
      .filter(e => e['@type'])
      .filter(e => this.schema.graph[e['@type']])
      .filter(e => this.schema.graph[e['@type']]['@type'] !== 'rdfs:Class')
      .filter(e => !Object.keys(this.validators).includes(this.schema.graph[e['@type']]['@type']))

    console.log('test', test.length, test.length < 10 ? test : '---')
  }

  // TODO Alias "@type": "http://id..."
  // TODO Enumeration subtypes
  // TODO supersededBy . Relates a term (i.e. a property, class or enumeration) to one that supersedes it.
  // TODO rdfs:subPropertyOf
}
