const uuid = require('uuid')
const config = require('../../config')
const User = require('../../models/user')
const jwt = require('../../services/jwt')
const AuthenticationError = require('../../services/error').AuthenticationError
const ValidationError = require('../../services/error').ValidationError

module.exports = (req, res, next) => {
  const email = req.body.email
  const password = req.body.password

  const tokenPayloads = {
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
          exp: tokenPayloads.refresh.exp,
          jti: tokenPayloads.refresh.jti,
        } } },
      ).exec()
    })
    .then(user => {
      if (!user) throw new AuthenticationError('User not found')
      if (user.emailVerifyToken) throw new AuthenticationError('Email is not validated')
      return user.comparePassword(password)
        .then(isMatch => {
          if (isMatch) {
            return user
          } else {
            throw new AuthenticationError('Password does not match')
          }
        })
    })
    .then(user => {
      return {
        refresh: { sub: user.id, ...tokenPayloads.refresh },
        access: { sub: user.id, ...tokenPayloads.access },
      }
    })
    .then(tokenPayloads => res.json({
      refreshToken: jwt.createToken(tokenPayloads.refresh),
      accessToken: jwt.createToken(tokenPayloads.access),
    }))
    .catch(error => {
      if (error instanceof ValidationError) {
        res.status(422).send({ error: error.message })
      } if (error instanceof AuthenticationError) {
        res.status(401).send({ error: error.message })
      } else {
        next(error)
      }
    })
}
