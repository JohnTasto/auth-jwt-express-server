/* eslint-env jest */

const request = require('supertest')
const mongoose = require('mongoose')
const app = require('../../app')
const jwt = require('../../services/jwt')

const User = mongoose.model('user')


describe('Controller: authentication', () => {

  const user = new User({
    email: 'test@test.com',
    password: 'Password1',
  })
  const token = jwt.createAccessToken(user).token

  beforeAll(async () => {
    await User.remove({})
    await user.save()
  })

  describe('/feature', () => {

    test('Get with valid token returns a message', async () => {
      const response = await request(app)
        .get('/feature')
        .set('authorization', `Bearer ${token}`)

      expect(response.status).toBe(200)
      expect(response.body.message).toBeDefined()
    })
  })

})
