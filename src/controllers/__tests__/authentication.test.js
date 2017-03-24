/* eslint-env jest */

const request = require('supertest')
const mongoose = require('mongoose')
const app = require('../../app')

const User = mongoose.model('user')


describe('Controller: authentication', () => {

  beforeEach(async () => {
    await User.remove({})
  })

  describe('SignUp', () => {

    test('Post to /signup creates a new user', async () => {
      const preCount = await User.count()
      const response = await request(app)
        .post('/signup')
        .send({
          email: 'test@test.com',
          password: 'Password1',
        })
      const postCount = await User.count()

      expect(response.status).toBe(200)
      expect(postCount).toBe(preCount + 1)
    })

  })

})
