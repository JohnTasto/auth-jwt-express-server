/* eslint-env jest */

const request = require('supertest')
const mongoose = require('mongoose')
const app = require('../../app')

const User = mongoose.model('user')


describe('Controller: authentication', () => {

  beforeEach(async () => {
    await User.remove({})
  })

  describe('/signup', () => {

    test('Post with valid email & password creates a new user', async () => {
      const response = await request(app)
        .post('/signup')
        .send({
          email: 'test@test.com',
          password: 'Password1',
        })
      const userCount = await User.count()

      expect(response.status).toBe(200)
      expect(userCount).toBe(1)
    })
  })

  describe('/signin', () => {

    test('Post with valid email & password for existing user returns a token', async () => {
      const user = new User({
        email: 'test@test.com',
        password: 'Password1',
      })
      await user.save()
      const response = await request(app)
        .post('/signin')
        .send({
          email: 'test@test.com',
          password: 'Password1',
        })

      expect(response.status).toBe(200)
      expect(response.body.token).toBeDefined()
    })
  })
})
