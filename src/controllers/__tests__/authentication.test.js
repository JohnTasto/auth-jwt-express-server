/* eslint-env jest */

const request = require('supertest')
const mongoose = require('mongoose')
const app = require('../../app')

const User = mongoose.model('user')


describe('Controller: authentication', () => {

  const user = {
    email: 'test@test.com',
    password: 'Password1',
  }

  beforeEach(async () => {
    await User.remove({})
  })

  describe('/signup', () => {

    test('Post with fresh email & password creates a new user', async () => {
      const response = await request(app)
        .post('/signup')
        .send(user)
      const userCount = await User.count()

      expect(userCount).toBe(1)
      expect(response.status).toBe(200)
    })

    test('Post with email already registered fails', async () => {
      const response1 = await request(app)
        .post('/signup')
        .send(user)
      const response2 = await request(app)
        .post('/signup')
        .send(user)
      const userCount = await User.count()

      expect(userCount).toBe(1)
      expect(response1.status).toBe(200)
      expect(response2.status).toBe(422)
      expect(typeof response2.body.error).toBe('string')
    })
  })

  describe('/signin', () => {

    beforeEach(async () => {
      await request(app)
        .post('/signup')
        .send(user)
    })

    test('Post with registered email & password returns a token', async () => {
      const response = await request(app)
        .post('/signin')
        .send(user)

      expect(response.status).toBe(200)
      expect(response.body.refreshToken).toBeDefined()
      expect(response.body.accessToken).toBeDefined()
    })

    test('Post with registered email & bad password fails', async () => {
      const response = await request(app)
        .post('/signin')
        .send({
          email: user.email,
          password: `!${user.password}`,
        })

      expect(response.status).toBe(401)
      expect(response.body.refreshToken).not.toBeDefined()
      expect(response.body.accessToken).not.toBeDefined()
    })

    test('Post with unregistered email fails', async () => {
      const response = await request(app)
        .post('/signin')
        .send({
          email: `a${user.email}`,
          password: user.password,
        })

      expect(response.status).toBe(401)
      expect(response.body.refreshToken).not.toBeDefined()
      expect(response.body.accessToken).not.toBeDefined()
    })
  })
})
