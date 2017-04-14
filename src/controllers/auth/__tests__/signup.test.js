/* eslint-env jest */

const request = require('supertest')
const mongoose = require('mongoose')
const app = require('../../../app')
const mail = require('../../../services/mail')

const User = mongoose.model('user')


describe('Controller: auth signup: POST /signup: create new user', () => {

  const userTemplate = {
    email: 'test@test.com',
    password: 'Password1',
  }

  beforeEach(async () => {
    await User.remove({})
    mail.sendEmailVerificationLink = jest.fn(() => Promise.resolve())
  })

  test('fresh email & password: creates a new user and sends email with token', async () => {
    const response = await request(app)
      .post('/signup')
      .send(userTemplate)
    const userCount = await User.count()
    const user = await User.findOne({ email: userTemplate.email })

    expect(response.status).toBe(201)
    expect(userCount).toBe(1)
    expect(user.verifyEmailToken).toBeDefined()
    expect(mail.sendEmailVerificationLink.mock.calls.length).toBe(1)
  })

  test('user exists but email not verified: recreates user and sends email with token', async () => {
    await User.create({
      ...userTemplate,
      verifyEmailToken: { exp: 42, jti: 42 },
    })

    const response = await request(app)
      .post('/signup')
      .send(userTemplate)
    const userCount = await User.count()
    const user = await User.findOne({ email: userTemplate.email })

    expect(response.status).toBe(201)
    expect(userCount).toBe(1)
    expect(user.verifyEmailToken).toBeDefined()
    expect(mail.sendEmailVerificationLink.mock.calls.length).toBe(1)
  })

  test('user exists and email verified: fails', async () => {
    await User.create(userTemplate)

    const response = await request(app)
      .post('/signup')
      .send(userTemplate)
    const userCount = await User.count()

    expect(userCount).toBe(1)
    expect(response.status).toBe(422)
  })
})
