const url = require('url')

module.exports = class SchemaValidator {
  constructor (schema) {
    this.schema = schema

    this.validators = {
      'rdfs:Class': (obj, context = '') => {
        console.log('rdfs:Class', obj['@type'])
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
          if (id[0] === '@') continue // ignore @..
          const propertyErrors = this.validators['rdf:Property'](id, value, context, type)
          if (propertyErrors.length) {
            errors = [...errors, ...propertyErrors]
          }
        }
        return errors
      },
      'rdf:Property': (id, value, context, type) => {
        console.log('rdf:Property', id)
        // Is there property in the vocabulary?
        let prop = this.schema.get(context + id)
        if (!prop || prop['@type'] !== 'rdf:Property') {
          return [`Property '${id}' not found in vocabulary.`]
        }

        // Does the property belong to the class/type/shape + Inheritance (in Parents)?
        let classes = this.schema.getSuperClasses(context + type)
        let propertyClasses = this.getArray(prop['http://schema.org/domainIncludes'])
        if (classes.filter(v => propertyClasses.indexOf(v) !== -1).length === 0) { // Intersection // TODO use includes and first
          return [`Property '${id}' not found in 'type'.`]
        }

        // Validate property value
        const propertyValueValidator = (val, i) => {
          let propName = i >= 0 ? `${id}[${i}]` : id
          let isValid = false
          let errors = []
          for (let valueTypeId of this.getArray(prop['http://schema.org/rangeIncludes'])) {
            // let valueType = this.schema.get(valueTypeId)
            // let types = typeof valueType['@type'] === 'string' ? [valueType['@type']] : valueType['@type']
            // if (types.includes('http://schema.org/DataType')) // Basic data types
            
            let validator = typeof val === 'string' ? valueTypeId : 'rdfs:Class'
            if (!this.validators[validator]) {
              console.log('Sin implementar:', validator, val)
              isValid = true // Considerar como correcto.
              // errors.push(`Type '${propName}' can't be validated due to input data type.`)
              break
            }
            
            // Extra type check for rdfs:Class
            if (validator === 'rdfs:Class') {
              let realValueType = context + val['@type']
              let expectedTypes = this.schema.getSuperClasses(valueTypeId)

              if (!expectedTypes.includes(valueTypeId)) {
                errors.push(`Type '${realValueType}' does not match the type '${valueTypeId}' of the property.`)
                continue
              }
            }

            let result = this.validators[validator](val, context)
            if (result === true || result.length === 0) {
              isValid = true
              break
            }

            // TODO validators must return array instead of boolean
            if (Array.isArray(result)) {
              errors = [...errors, ...result]
            } else if (!result) {
              errors = [...errors, `'${id}' is not valid ${valueTypeId}.`]
            }
          }

          if (!isValid) {
            return [`Property '${propName}' not valid because:`, errors]
          }

          return [] // All ok, return 0 errors
        }

        if (Array.isArray(value)) { // when an array is valid value?
          return [].concat.apply([], value.map(propertyValueValidator))
        } else {
          return propertyValueValidator(value)
        }
      },
      'http://schema.org/DateTime': value => {
        try {
          return (new Date(value)).toISOString() === value
        } catch (err) {
          return false
        }
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
        try {
          return Number.isInteger(+value) && parseInt(value).toString() === value.toString()
        } catch (err) {
          return false
        }
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
      }
    }
  }

  validate (obj, context = '') {
    let result
    try {
      result = this.validators['rdfs:Class'](obj, context)
    } catch (err) {
      console.log('Excepción')
      result = err
    }
    console.log(result)
    return result
  }

  /**
   * A veces es un valor, otras veces un array de valores
   */
  getArray (obj) {
    return !obj['@id'] ? obj.map(e => e['@id']) : [obj['@id']]
  }

  // TODO inheritance from children ¿? (https://schema.org/Product  example 3 offers is AggregateOffer (child of Offer))
  // TODO Enumeration subtypes: "rdfs:subClassOf": "http://schema.org/Enumeration"
  // TODO supersededBy: Relates a term (i.e. a property, class or enumeration) to one that supersedes it.
  // TODO rdfs:subPropertyOf
}
