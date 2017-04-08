/* eslint-env jest */

const request = require('supertest')
const mongoose = require('mongoose')
const app = require('../../../app')

const User = mongoose.model('user')


describe('Controller: auth /signup', () => {

  const userTemplate = {
    email: 'test@test.com',
    password: 'Password1',
  }

  beforeEach(async () => {
    await User.remove({})
  })

  test('Post with fresh email & password creates a new user', async () => {
    const response = await request(app)
      .post('/signup')
      .send(userTemplate)
    const userCount = await User.count()

    expect(userCount).toBe(1)
    expect(response.status).toBe(200)
  })

  test('Post with email already registered fails', async () => {
    await User.create(userTemplate)
    const response = await request(app)
      .post('/signup')
      .send(userTemplate)
    const userCount = await User.count()

    expect(userCount).toBe(1)
    expect(response.status).toBe(422)
    expect(typeof response.body.error).toBe('string')
  })
})
