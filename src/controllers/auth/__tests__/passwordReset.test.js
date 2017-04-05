/* eslint-env jest */

const request = require('supertest')
const mongoose = require('mongoose')
const app = require('../../../app')
const mail = require('../../../services/mail')

const User = mongoose.model('user')


describe('Controller: auth /resetpassword', () => {

  const user = {
    email: 'test@test.com',
    password: 'Password1',
  }

  beforeEach(async () => {
    mail.sendPasswordResetLink = jest.fn(() => Promise.resolve())
    await User.remove({})
    await request(app)
      .post('/signup')
      .send(user)
  })

  test('Get with verified email & password sends email with token', async () => {
    const response = await request(app)
      .get('/resetpassword')
      .send({ email: user.email })

    expect(response.status).toBe(200)
    expect(mail.sendPasswordResetLink.mock.calls.length).toBe(1)
  })

  test('Patch with valid password reset token and password changes password', async () => {
    const newPassword = 'Password2'
    await request(app)
      .get('/resetpassword')
      .send({ email: user.email })
    const passwordResetToken = mail.sendPasswordResetLink.mock.calls[0][1]
    const response = await request(app)
      .patch('/resetpassword')
      .set('authorization', `Bearer ${passwordResetToken}`)
      .send({ password: newPassword })
    const modifiedUser = await User.findOne({ email: user.email })
    const isMatch = await modifiedUser.comparePassword(newPassword)

    expect(response.status).toBe(200)
    expect(isMatch).toBeTruthy()
  })
})
