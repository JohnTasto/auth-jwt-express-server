/* eslint-env jest */

const request = require('supertest')
const mongoose = require('mongoose')
const uuid = require('uuid')
const config = require('../../../config')
const jwt = require('../../../services/jwt')
const app = require('../../../app')
const mail = require('../../../services/mail')

const User = mongoose.model('user')

// TODO: test that we can't reset password if email is not verified
//       test that we can't reset password with a token where jti doesn't match

describe('Controller: auth /resetpassword', () => {

  const userTemplate = {
    email: 'test@test.com',
    password: 'Password1',
  }

  beforeEach(async () => {
    await User.remove({})
  })


  describe('Send password reset email', () => {

    beforeEach(() => {
      mail.sendPasswordResetLink = jest.fn(() => Promise.resolve())
    })

    test('Get with verified email & password sends email with token', async () => {
      await User.create(userTemplate)
      const response = await request(app)
        .get('/resetpassword')
        .send({ email: userTemplate.email })

      expect(response.status).toBe(200)
      expect(mail.sendPasswordResetLink.mock.calls.length).toBe(1)
    })
  })


  describe('Change password', () => {

    const tokenPayload = {
      aud: 'password reset',
      exp: jwt.expiry(config.jwt.passwordResetExpiry),
      jti: uuid.v4(),
    }

    test('Patch with valid password reset token and password changes password', async () => {
      const newPassword = 'Password2'
      const { id: sub } = await User.create({
        ...userTemplate,
        passwordResetToken: { exp: tokenPayload.exp, jti: tokenPayload.jti },
      })
      const token = jwt.createToken({ sub, ...tokenPayload })

      const response = await request(app)
        .patch('/resetpassword')
        .set('authorization', `Bearer ${token}`)
        .send({ password: newPassword })

      const user = await User.findOne({ email: userTemplate.email })
      const isMatch = await user.comparePassword(newPassword)

      expect(response.status).toBe(200)
      expect(isMatch).toBeTruthy()
    })
  })
})
