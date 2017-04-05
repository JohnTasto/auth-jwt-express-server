const moment = require('moment')
const config = require('../../config')
const User = require('../../models/user')
const jwt = require('../../services/jwt')

const emailValidator = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i
const passwordValidator = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/


class ValidationError extends Error {
  constructor(message) {
    super(message)
    this.name = 'ValidationError'
  }
}


module.exports = (req, res, next) => {
  const email = req.body.email
  const password = req.body.password

  Promise.resolve()
    .then(() => {
      if (!email)                            throw new ValidationError('No email provided')
      if (!emailValidator.test(email))       throw new ValidationError('Malformed email')
      return User.findOne({ email: email }).exec()
    })
    .then(existingUser => {
      // Password errors could be checked earlier, but I feel it makes for a
      // better user experience if email errors show up first. Also, the front
      // end should be doing validation already so these shouldn't be hit.
      if (existingUser)                      throw new ValidationError('Email is in use')
      if (!password)                         throw new ValidationError('No password provided')
      if (!passwordValidator.test(password)) throw new ValidationError('Insecure password')
      const user = new User({
        email,
        password,
        refreshTokens: [{ exp: moment().add(...config.jwt.refreshExpiry).valueOf() }],
      })
      return user.save()
    })
    .then(user => res.json({
      refreshToken: jwt.createToken({
        aud: 'refresh',
        sub: user.id,
        exp: user.refreshTokens[0].exp,
        jti: user.refreshTokens[0].id,
      }),
      accessToken: jwt.createToken({
        aud: 'access',
        sub: user.id,
        exp: moment().add(...config.jwt.accessExpiry).valueOf(),
      }),
    }))
    .catch(error => {
      if (error instanceof ValidationError) {
        res.status(422).send({ error: error.message })
      } else {
        next(error)
      }
    })
}
