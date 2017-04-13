/* eslint-env jest */

const request = require('supertest')
const mongoose = require('mongoose')
const uuid = require('uuid')
const config = require('../../../config')
const jwt = require('../../../services/jwt')
const app = require('../../../app')

const User = mongoose.model('user')


describe('Controller: auth verify', () => {

  const userTemplate = {
    email: 'test@test.com',
    password: 'Password1',
  }

  beforeEach(async () => {
    await User.remove({})
  })


  describe('PATCH /verifyemail: verify user owns email address', () => {

    const tokenTemplate = {
      aud: 'verify email',
      exp: jwt.expiry(config.jwt.verifyEmailExpiry),
      jti: uuid.v4(),
    }

    test('valid verify email token: verifies user and returns refresh and access tokens', async () => {
      const { id: sub } = await User.create({
        ...userTemplate,
        verifyEmailToken: { exp: tokenTemplate.exp, jti: tokenTemplate.jti },
      })
      const token = jwt.createToken({ sub, ...tokenTemplate })

      const response = await request(app)
        .patch('/verifyemail')
        .set('authorization', `Bearer ${token}`)
      const user = await User.findOne({ email: userTemplate.email })

      expect(response.status).toBe(200)
      expect(response.body.refreshToken).toBeDefined()
      expect(response.body.accessToken).toBeDefined()
      expect(user.verifyEmailToken).not.toBeDefined()
      expect(user.refreshTokens).toHaveLength(1)
    })

    test('wrong jti in verify email token: fails', async () => {
      const { id: sub } = await User.create({
        ...userTemplate,
        verifyEmailToken: { exp: tokenTemplate.exp, jti: uuid.v4() },
      })
      const token = jwt.createToken({ sub, ...tokenTemplate })

      const response = await request(app)
        .patch('/verifyemail')
        .set('authorization', `Bearer ${token}`)
      const user = await User.findOne({ email: userTemplate.email })

      expect(response.status).toBe(401)
      expect(response.body.refreshToken).not.toBeDefined()
      expect(response.body.accessToken).not.toBeDefined()
      expect(user.verifyEmailToken).toBeDefined()
      expect(user.refreshTokens).toHaveLength(0)
    })
  })
})
