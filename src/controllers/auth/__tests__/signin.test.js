/* eslint-env jest */

const request = require('supertest')
const mongoose = require('mongoose')
const app = require('../../../app')

const User = mongoose.model('user')

// TODO: make sure we can't sign in unless email is ACTUALLY verified

describe('Controller: auth signin: PATCH /signin: sign in user', () => {

  const userTemplate = {
    email: 'test@test.com',
    password: 'Password1',
  }

  beforeEach(async () => {
    await User.remove({})
    await User.create({
      ...userTemplate,
      password: await User.hashPassword(userTemplate.password),
    })
  })

  test('PATCH with verified email & password returns refresh and access tokens', async () => {
    const response = await request(app)
      .patch('/signin')
      .send(userTemplate)

    expect(response.status).toBe(200)
    expect(response.body.refreshToken).toBeDefined()
    expect(response.body.accessToken).toBeDefined()
  })

  test('PATCH with verified email & bad password fails', async () => {
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

  test('PATCH with unverified email fails', async () => {
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
})
