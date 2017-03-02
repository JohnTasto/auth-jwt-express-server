// Main starting point of the application
const express = require('express')
const http = require('http')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const app = express()
const router = require('./router')
const mongoose = require('mongoose')
const cors = require('cors')

// DB Setup
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:auth/auth')

// App Setup
app.use(morgan('combined'))
app.use(cors())
app.use(bodyParser.json({ type: '*/*' }))
router(app)

// Server Setup
const port = process.env.PORT || 9090
const server = http.createServer(app)
server.listen(port)
console.log(`Listening on ${port}`)
