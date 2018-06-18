const express = require('express')
const bodyParser = require('body-parser')
const SchemaApiRoutes = require('./routes/SchemaApiRoutes')

const app = express()
const port = process.env.PORT || 3000

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use('/', (new SchemaApiRoutes()).getRouter())

app.listen(port)

console.log('RESTful API server started on: ' + port)
