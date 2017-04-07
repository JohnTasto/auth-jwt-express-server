const uuid = require('uuid')
const config = require('../../config')
const User = require('../../models/user')
const jwt = require('../../services/jwt')
// const ValidationError = require('../../services/error').ValidationError

const emailValidator = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i
const passwordValidator = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/


module.exports = (req, res, next) => {
  const email = req.body.email
  const password = req.body.password

  if (!email)                            return res.status(422).send({ error: 'No email provided' })
  if (!emailValidator.test(email))       return res.status(422).send({ error: 'Malformed email' })
  if (!password)                         return res.status(422).send({ error: 'No password provided' })
  if (!passwordValidator.test(password)) return res.status(422).send({ error: 'Insecure password' })

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

  User.hashPassword(req.body.password)
    .then(hashedPassword => {
      return User.create({
        email,
        password: hashedPassword,
        refreshTokens: [{ exp: tokenPayloads.refresh.exp, jti: tokenPayloads.refresh.jti }],
      })
    })
    .then(user => res.json({
      refreshToken: jwt.createToken({ sub: user.id, ...tokenPayloads.refresh }),
      accessToken: jwt.createToken({ sub: user.id, ...tokenPayloads.access }),
    }))
    .catch(error => {
      if (error.code === 11000) {
        res.status(422).send({ error: 'Email already in use' })
      } else {
        next(error)
      }
    })
}
