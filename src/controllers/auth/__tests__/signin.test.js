/* eslint-env jest */

const request = require('supertest')
const mongoose = require('mongoose')
const app = require('../../../app')

const User = mongoose.model('user')


describe('Controller: auth signin: PATCH /signin: sign in user', () => {

  const userTemplate = {
    email: 'test@test.com',
    password: 'Password1',
  }

  beforeEach(async () => {
    await User.remove({})
  })

  test('verified email & password: returns refresh and access tokens', async () => {
    await User.create({
      ...userTemplate,
      password: await User.hashPassword(userTemplate.password),
    })

    const response = await request(app)
      .patch('/signin')
      .send(userTemplate)
    const user = await User.findOne({ email: userTemplate.email })

    expect(response.status).toBe(200)
    expect(response.body.refreshToken).toBeDefined()
    expect(response.body.accessToken).toBeDefined()
    expect(user.refreshTokens).toHaveLength(1)
  })

  test('verified email & bad password: fails', async () => {
    await User.create({
      ...userTemplate,
      password: await User.hashPassword(userTemplate.password),
    })

    const response = await request(app)
      .patch('/signin')
      .send({
        ...userTemplate,
        password: `!${userTemplate.password}`,
      })

    expect(response.status).toBe(401)
    expect(response.body.refreshToken).not.toBeDefined()
    expect(response.body.accessToken).not.toBeDefined()
  })

  test('unregistered email: fails', async () => {
    await User.create({
      ...userTemplate,
      password: await User.hashPassword(userTemplate.password),
    })

    const response = await request(app)
      .patch('/signin')
      .send({
        ...userTemplate,
        email: `a${userTemplate.email}`,
      })

    expect(response.status).toBe(401)
    expect(response.body.refreshToken).not.toBeDefined()
    expect(response.body.accessToken).not.toBeDefined()
  })

  test('unverified email: fails', async () => {
    await User.create({
      ...userTemplate,
      password: await User.hashPassword(userTemplate.password),
      verifyEmailToken: { exp: 42, jti: 42 },
    })

    const response = await request(app)
      .patch('/signin')
      .send(userTemplate)

    expect(response.status).toBe(401)
    expect(response.body.refreshToken).not.toBeDefined()
    expect(response.body.accessToken).not.toBeDefined()
  })
})
