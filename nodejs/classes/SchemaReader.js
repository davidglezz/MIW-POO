const fs = require('fs')

module.exports = class SchemaReader {
  constructor (filepath) {
    this.graph = {}
    fs.readFile(filepath, 'utf8', (err, data) => {
      if (err) throw err
      const obj = JSON.parse(data)
      if (!obj || !obj['@graph']) throw 'Invalid input data. @graph not found.'
      obj['@graph'].forEach(element => {
        this.graph[element['@id']] = element
      })
    })
  }

  get (id) {
    return this.graph[id]
  }

  getSuperClasses (id) {
    let klass = this.graph[id]

    if (!klass || klass['@type'] !== 'rdfs:Class') {
      return []
    }

    let classes = [id]

    // zero parents
    if (!klass['rdfs:subClassOf']) {
      return classes
    }

    // one parent
    if (klass['rdfs:subClassOf']['@id']) {
      let superSuper = this.getSuperClasses(klass['rdfs:subClassOf']['@id'])
      return [...new Set([...classes, ...superSuper])] // Merge and unique
    }

    // multiple parents
    for (let superClass of klass['rdfs:subClassOf']) {
      let superSuper = this.getSuperClasses(superClass['@id'])
      classes = [...classes, ...superSuper] // Merge
    }

    return [...new Set(classes)]
  }

  getTypes () {
    return Object.values(this.graph)
      .filter(e => e['@type'] && e['@type'] === 'rdfs:Class')
  }
}
