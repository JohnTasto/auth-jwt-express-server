/* eslint-env jest */

const request = require('supertest')
const mongoose = require('mongoose')
const uuid = require('uuid')
const config = require('../../../config')
const jwt = require('../../../services/jwt')
const app = require('../../../app')

const User = mongoose.model('user')


describe('Controller: auth /refresh', () => {

  const userTemplate = {
    email: 'test@test.com',
    password: 'Password1',
  }

  const tokenPayload = {
    aud: 'refresh',
    exp: jwt.expiry(config.jwt.refreshExpiry),
    jti: uuid.v4(),
  }

  beforeEach(async () => {
    await User.remove({})
  })

  test('Post with valid refresh token returns access token', async () => {
    const { id: sub } = await User.create({
      ...userTemplate,
      refreshTokens: [{ exp: tokenPayload.exp, jti: tokenPayload.jti }],
    })
    const token = jwt.createToken({ sub, ...tokenPayload })

    const response = await request(app)
      .get('/refresh')
      .set('authorization', `Bearer ${token}`)

    expect(response.status).toBe(200)
    expect(response.body.accessToken).toBeDefined()
  })

  test('Post with valid refresh token removes expired tokens from DB', async () => {
    const { id: sub } = await User.create({
      ...userTemplate,
      refreshTokens: [
        { exp: tokenPayload.exp, jti: tokenPayload.jti },
        { exp: jwt.expiry([ -1, 'days' ]), jti: uuid.v4() },
        { exp: jwt.expiry([  8, 'days' ]), jti: uuid.v4() },  // eslint-disable-line standard/array-bracket-even-spacing
      ],
    })
    const token = jwt.createToken({ sub, ...tokenPayload })

    const response = await request(app)
      .get('/refresh')
      .set('authorization', `Bearer ${token}`)
    const user = await User.findOne({ email: userTemplate.email })

    expect(response.status).toBe(200)
    expect(user.refreshTokens).toHaveLength(2)
  })

  test('Post with wrong jti in refresh token fails', async () => {
    const { id: sub } = await User.create({
      ...userTemplate,
      refreshTokens: [{ exp: tokenPayload.exp, jti: uuid.v4() }],
    })
    const token = jwt.createToken({ sub, ...tokenPayload })

    const response = await request(app)
      .get('/refresh')
      .set('authorization', `Bearer ${token}`)

    expect(response.status).toBe(401)
    expect(response.body.accessToken).not.toBeDefined()
  })
})
