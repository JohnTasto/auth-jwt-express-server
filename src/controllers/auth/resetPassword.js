const uuid = require('uuid')
const config = require('../../config')
const User = require('../../models/user')
const jwt = require('../../services/jwt')
const mail = require('../../services/mail')


module.exports.sendToken = (req, res, next) => {
  const email = req.body.email

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
      const token = jwt.createToken({ sub: user.id, ...tokenTemplate })
      return mail.sendResetPasswordLink(email, token)
    })
    .then(() => res.sendStatus(200))
    .catch(error => {
      console.log(error)
      next(error)
    })
}


module.exports.setPassword = (req, res, next) => {
  const payload = req.payload
  const password = req.body.password

  User.hashPassword(password)
    .then(hashedPassword =>
      User.findOneAndUpdate(
        {
          _id: payload.sub,
          'resetPasswordToken.jti': payload.jti,
          verifyEmailToken: { $exists: false },
        },
        {
          $set: {
            password: hashedPassword,
            resetTokens: [],
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
