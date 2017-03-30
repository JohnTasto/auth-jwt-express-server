/* eslint-env jest */

const request = require('supertest')
const mongoose = require('mongoose')
const app = require('../../../app')

const User = mongoose.model('user')


describe('Controller: auth /signin', () => {

  const user = {
    email: 'test@test.com',
    password: 'Password1',
  }

  beforeEach(async () => {
    await User.remove({})
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
