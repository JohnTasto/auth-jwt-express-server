const express = require('express')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const router = require('./router')
const mongoose = require('mongoose')
const cors = require('cors')
const config = require('./config')

mongoose.Promise = Promise

const app = express()

if (process.env.NODE_ENV !== 'test') {
  mongoose.connect(config.mongoURI)
  app.use(morgan('combined'))
}

app.use(cors())
app.use(bodyParser.json({ type: '*/*' }))
router(app)

module.exports = app
