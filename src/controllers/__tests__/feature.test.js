/* eslint-env jest */

const request = require('supertest')
const mongoose = require('mongoose')
const config = require('../../config')
const jwt = require('../../services/jwt')
const app = require('../../app')

const User = mongoose.model('user')


describe('Controller: feature', () => {

  const userTemplate = {
    email: 'test@test.com',
    password: 'Password1',
  }

  const tokenTemplate = {
    aud: 'access',
    exp: jwt.expiry(config.jwt.accessExpiry),
  }

  beforeEach(async () => {
    await User.remove({})
  })

  describe('GET /feature: access protected resources', () => {

    test('GET with valid access token returns a message', async () => {
      const { id: sub } = await User.create(userTemplate)
      const token = jwt.createToken({ sub, ...tokenTemplate })

      const response = await request(app)
        .get('/feature')
        .set('authorization', `Bearer ${token}`)

      expect(response.status).toBe(200)
      expect(response.body.message).toBeDefined()
    })

    test('GET with expired access token fails', async () => {
      const { id: sub } = await User.create(userTemplate)
      const exp = jwt.expiry([ -1, 'minutes' ])
      const token = jwt.createToken({ sub, ...tokenTemplate, exp })

      const response = await request(app)
        .get('/feature')
        .set('authorization', `Bearer ${token}`)

      expect(response.status).toBe(401)
      expect(response.body.message).not.toBeDefined()
    })
  })

})
