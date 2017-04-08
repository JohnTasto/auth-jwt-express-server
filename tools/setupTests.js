/* eslint-env jest */

const mongoose = require('mongoose')
mongoose.Promise = Promise

beforeAll(done => {
  mongoose.connect(process.env.MONGO_TEST_URI || 'mongodb://localhost/auth_test')
  mongoose.connection
    .once('open', done)
    .on('error', error => {
      console.warn('Warning', error)
    })
})

afterAll(done => {
  mongoose.disconnect()
  mongoose.connection
    .once('disconnected', done)
})
