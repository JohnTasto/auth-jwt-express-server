/* eslint-env jest */

const mongoose = require('mongoose')

beforeAll(done => {
  mongoose.connect(process.env.MONGO_TEST_URI || 'mongodb://localhost/auth_test')
  mongoose.connection
    .once('open', () => clearAllCollections(done))
    .on('error', error => {
      console.warn('Warning', error)
    })
})

afterEach(done => {
  const { users } = mongoose.connection.collections
  users.drop(() => {
    clearAllCollections(done)
  })
})

function clearAllCollections(done) {
  const { users } = mongoose.connection.collections
  users.drop(() => {
    done()
  })
}
