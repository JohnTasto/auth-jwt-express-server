const uuid = require('uuid')
const config = require('../../config')
const User = require('../../models/user')
const jwt = require('../../services/jwt')
const mail = require('../../services/mail')
const AuthenticationError = require('../../services/error').AuthenticationError
const validators = require('../../services/validators')


module.exports.sendResetToken = (req, res, next) => {
  const { body: { email } } = req

  const tokenTemplate = {
    aud: 'reset password',
    exp: jwt.expiry(config.jwt.resetPasswordExpiry),
    jti: uuid.v4(),
  }

  Promise.resolve()
    .then(() =>
      User.findOneAndUpdate(
        {
          email,
          verifyEmailToken: { $exists: false },
        },
        {
          $set: { resetPasswordToken: {
            exp: tokenTemplate.exp,
            jti: tokenTemplate.jti,
          } },
        },
      ).exec()
    )
    .then(user => {
      if (!user) throw new AuthenticationError('User not found')
      if (user.verifyEmailToken) throw new AuthenticationError('Email is not verified')
      const token = jwt.createToken({ sub: user.id, ...tokenTemplate })
      return mail.sendResetPasswordLink(email, token)
    })
    .then(() => res.sendStatus(200))
    .catch(error => {
      if (error instanceof AuthenticationError) {
        res.status(401).send({ error: error.message })
      } else {
        console.log(error)
        next(error)
      }
    })
}


module.exports.reset = (req, res, next) => {
  const { payload: { sub, jti }, body: { password } } = req
  // const payload = req.payload
  // const password = req.body.password

  if (!password)                           return res.status(422).send({ error: 'No password provided' })
  if (!validators.password.test(password)) return res.status(422).send({ error: 'Insecure password' })

  User.hashPassword(password)
    .then(hashedPassword =>
      User.findOneAndUpdate(
        {
          _id: sub,
          'resetPasswordToken.jti': jti,
          verifyEmailToken: { $exists: false },
        },
        {
          $set: {
            password: hashedPassword,
            refreshTokens: [],
          },
          $unset: {
            resetPasswordToken: '',
          },
        }
      ).exec()
    )
    .then(user => {
      if (user) {
        res.sendStatus(200)
      } else {
        res.status(401).send({ error: 'Invalid token' })
      }
    })
    .catch(error => {
      console.log(error)
      next(error)
    })
}
