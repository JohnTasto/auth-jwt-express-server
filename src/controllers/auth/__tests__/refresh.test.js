/* eslint-env jest */

const request = require('supertest')
const mongoose = require('mongoose')
const app = require('../../../app')

const User = mongoose.model('user')


describe('Controller: auth /refresh', () => {

  const user = {
    email: 'test@test.com',
    password: 'Password1',
  }

  beforeEach(async () => {
    await User.remove({})
  })

  test('Post with valid refresh token returns access token', async () => {
    const { body: { refreshToken } } = await request(app)
      .post('/signup')
      .send(user)
    const response = await request(app)
      .get('/refresh')
      .set('authorization', `Bearer ${refreshToken}`)

    expect(response.status).toBe(200)
    expect(response.body.accessToken).toBeDefined()
  })

  test('Post with invalid refresh token fails', async () => {
    const { body: { accessToken } } = await request(app)
      .post('/signup')
      .send(user)
    const response = await request(app)
      .get('/refresh')
      .set('authorization', `Bearer ${accessToken}`)

    expect(response.status).toBe(401)
    expect(response.body.accessToken).not.toBeDefined()
  })
})
