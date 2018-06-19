const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const SchemaApiRoutes = require('./routes/SchemaApiRoutes')

const app = express()
const port = process.env.PORT || 8002

app.use(cors())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use('/', (new SchemaApiRoutes()).getRouter())

app.listen(port)

console.log('RESTful API server started on: ' + port)
