/* eslint-env jest */

const request = require('supertest')
const mongoose = require('mongoose')
const uuid = require('uuid')
const config = require('../../../config')
const jwt = require('../../../services/jwt')
const app = require('../../../app')
const mail = require('../../../services/mail')

const User = mongoose.model('user')


describe('Controller: auth password', () => {

  const userTemplate = {
    email: 'test@test.com',
    password: 'Password1',
  }

  beforeEach(async () => {
    await User.remove({})
  })


  describe('GET /resetpassword: send reset password email', () => {

    beforeEach(() => {
      mail.sendResetPasswordLink = jest.fn(() => Promise.resolve())
    })

    test('verified email: sends email with token', async () => {
      await User.create(userTemplate)
      const response = await request(app)
        .get('/resetpassword')
        .send({ email: userTemplate.email })

      expect(response.status).toBe(200)
      expect(mail.sendResetPasswordLink.mock.calls.length).toBe(1)
    })

    test('unregistered email: fails', async () => {
      const response = await request(app)
        .get('/resetpassword')
        .send({ email: userTemplate.email })

      expect(response.status).toBe(401)
      expect(mail.sendResetPasswordLink.mock.calls.length).toBe(0)
    })

    test('unverified email: fails', async () => {
      await User.create({
        ...userTemplate,
        verifyEmailToken: { exp: 42, jti: 42 },
      })
      const response = await request(app)
        .get('/resetpassword')
        .send({ email: userTemplate.email })

      expect(response.status).toBe(401)
      expect(mail.sendResetPasswordLink.mock.calls.length).toBe(0)
    })
  })


  describe('PATCH /resetpassword: reset password', () => {

    const tokenTemplate = {
      aud: 'reset password',
      exp: jwt.expiry(config.jwt.resetPasswordExpiry),
      jti: uuid.v4(),
    }

    test('valid reset password token and password: resets password and signs out user', async () => {
      const newPassword = 'Password2'
      const { id: sub } = await User.create({
        ...userTemplate,
        refreshTokens: [{ exp: 42, jti: 42 }],
        resetPasswordToken: { exp: tokenTemplate.exp, jti: tokenTemplate.jti },
      })
      const token = jwt.createToken({ sub, ...tokenTemplate })

      const response = await request(app)
        .patch('/resetpassword')
        .set('authorization', `Bearer ${token}`)
        .send({ password: newPassword })
      const user = await User.findOne({ email: userTemplate.email })
      const isMatch = await user.comparePassword(newPassword)

      expect(response.status).toBe(200)
      expect(isMatch).toBeTruthy()
      expect(user.resetPasswordToken).not.toBeDefined()
      expect(user.refreshTokens).toHaveLength(0)
    })

    test('wrong jti in reset password token: fails', async () => {
      const newPassword = 'Password2'
      const { id: sub } = await User.create({
        ...userTemplate,
        refreshTokens: [{ exp: 42, jti: 42 }],
        resetPasswordToken: { exp: tokenTemplate.exp, jti: uuid.v4() },
      })
      const token = jwt.createToken({ sub, ...tokenTemplate })

      const response = await request(app)
        .patch('/resetpassword')
        .set('authorization', `Bearer ${token}`)
        .send({ password: newPassword })
      const user = await User.findOne({ email: userTemplate.email })
      const isMatch = await user.comparePassword(newPassword)

      expect(response.status).toBe(401)
      expect(isMatch).toBeFalsy()
      expect(user.resetPasswordToken).toBeDefined()
      expect(user.refreshTokens).toHaveLength(1)
    })

    test('unverified email: fails', async () => {
      const newPassword = 'Password2'
      const { id: sub } = await User.create({
        ...userTemplate,
        refreshTokens: [{ exp: 42, jti: 42 }],
        verifyEmailToken: { exp: 42, jti: 42 },
        resetPasswordToken: { exp: tokenTemplate.exp, jti: tokenTemplate.jti },
      })
      const token = jwt.createToken({ sub, ...tokenTemplate })

      const response = await request(app)
        .patch('/resetpassword')
        .set('authorization', `Bearer ${token}`)
        .send({ password: newPassword })
      const user = await User.findOne({ email: userTemplate.email })
      const isMatch = await user.comparePassword(newPassword)

      expect(response.status).toBe(401)
      expect(isMatch).toBeFalsy()
      expect(user.resetPasswordToken).toBeDefined()
      expect(user.refreshTokens).toHaveLength(1)
    })
  })


  describe('PATCH /changepassword: change password', () => {

    test('verified email and password: resets password and returns new refresh and access tokens', async () => {
      const newPassword = 'Password2'
      await User.create({
        ...userTemplate,
        password: await User.hashPassword(userTemplate.password),
        refreshTokens: [
          { exp: 42, jti: 42 },
          { exp: 1337, jti: 1337 },
        ],
      })

      const response = await request(app)
        .patch('/changepassword')
        .send({ ...userTemplate, newPassword })
      const user = await User.findOne({ email: userTemplate.email })
      const isMatch = await user.comparePassword(newPassword)

      expect(response.status).toBe(200)
      expect(response.body.refreshToken).toBeDefined()
      expect(response.body.accessToken).toBeDefined()
      expect(isMatch).toBeTruthy()
      expect(user.refreshTokens).toHaveLength(1)
    })

    test('verified email & bad password: fails', async () => {
      const newPassword = 'Password2'
      await User.create(userTemplate)

      const response = await request(app)
        .patch('/changepassword')
        .send({ ...userTemplate, newPassword })
      const user = await User.findOne({ email: userTemplate.email })
      const isMatch = await user.comparePassword(newPassword)

      expect(response.status).toBe(401)
      expect(response.body.refreshToken).not.toBeDefined()
      expect(response.body.accessToken).not.toBeDefined()
      expect(isMatch).toBeFalsy()
      expect(user.refreshTokens).toHaveLength(0)
    })

    test('unregistered email: fails', async () => {
      const newPassword = 'Password2'

      const response = await request(app)
        .patch('/changepassword')
        .send({ ...userTemplate, newPassword })
      const user = await User.findOne({ email: userTemplate.email })

      expect(response.status).toBe(401)
      expect(response.body.refreshToken).not.toBeDefined()
      expect(response.body.accessToken).not.toBeDefined()
      expect(user).toBe(null)
    })

    test('unverified email and password: fails', async () => {
      const newPassword = 'Password2'
      await User.create({
        ...userTemplate,
        password: await User.hashPassword(userTemplate.password),
        verifyEmailToken: { exp: 42, jti: 42 },
      })

      const response = await request(app)
        .patch('/changepassword')
        .send({ ...userTemplate, newPassword })
      const user = await User.findOne({ email: userTemplate.email })
      const isMatch = await user.comparePassword(newPassword)

      expect(response.status).toBe(401)
      expect(response.body.refreshToken).not.toBeDefined()
      expect(response.body.accessToken).not.toBeDefined()
      expect(isMatch).toBeFalsy()
      expect(user.refreshTokens).toHaveLength(0)
    })
  })
})
