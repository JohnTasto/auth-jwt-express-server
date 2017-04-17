const uuid = require('uuid')
const config = require('../../config')
const User = require('../../models/user')
const jwt = require('../../services/jwt')
const AuthenticationError = require('../../services/error').AuthenticationError
const ValidationError = require('../../services/error').ValidationError

module.exports = (req, res, next) => {
  const { body: { email, password } } = req

  const tokenTemplates = {
    refresh: {
      aud: 'refresh',
      exp: jwt.expiry(config.jwt.refreshExpiry),
      jti: uuid.v4(),
    },
    access: {
      aud: 'access',
      exp: jwt.expiry(config.jwt.accessExpiry),
    },
  }

  Promise.resolve()
    .then(() => {
      if (!email) throw new ValidationError('No email provided')
      return User.findOneAndUpdate(
        { email: email },
        { $push: { refreshTokens: {
          exp: tokenTemplates.refresh.exp,
          jti: tokenTemplates.refresh.jti,
        } } },
      ).exec()
    })
    .then(user => {
      if (!user) throw new AuthenticationError('User not found')
      if (user.verifyEmailToken) throw new AuthenticationError('Email is not verified')
      return user.comparePassword(password)
        .then(isMatch => {
          if (isMatch) {
            return user
          } else {
            throw new AuthenticationError('Password does not match')
          }
        })
    })
    .then(user => res.json({
      refreshToken: jwt.createToken({ sub: user.id, ...tokenTemplates.refresh }),
      accessToken: jwt.createToken({ sub: user.id, ...tokenTemplates.access }),
      time: jwt.now(),
    }))
    .catch(error => {
      if (error instanceof ValidationError) {
        res.status(422).send(error.message)
      } if (error instanceof AuthenticationError) {
        res.status(401).send(error.message)
      } else {
        console.log(error)
        next(error)
      }
    })
}
