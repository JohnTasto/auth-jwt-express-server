/* eslint-env jest */

const request = require('supertest')
const mongoose = require('mongoose')
const app = require('../../app')

const User = mongoose.model('user')


describe('Controller: feature', () => {

  const user = {
    email: 'test@test.com',
    password: 'Password1',
  }

  beforeEach(async () => {
    await User.remove({})
  })

  describe('/feature', () => {

    test('Get with valid access token returns a message', async () => {
      const { body: { accessToken } } = await request(app)
        .post('/signup')
        .send(user)
      const response = await request(app)
        .get('/feature')
        .set('authorization', `Bearer ${accessToken}`)

      expect(response.status).toBe(200)
      expect(response.body.message).toBeDefined()
    })

    test('Get with invalid access token fails', async () => {
      const { body: { refreshToken } } = await request(app)
        .post('/signup')
        .send(user)
      const response = await request(app)
        .get('/feature')
        .set('authorization', `Bearer ${refreshToken}`)

      expect(response.status).toBe(401)
      expect(response.body.message).not.toBeDefined()
    })
  })

})
