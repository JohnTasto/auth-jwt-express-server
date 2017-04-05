const moment = require('moment')
const config = require('../../config')
const User = require('../../models/user')
const jwt = require('../../services/jwt')
const mail = require('../../services/mail')


module.exports.sendToken = (req, res, next) => {
  const email = req.body.email
  const exp = moment().add(...config.jwt.passwordResetExpiry).valueOf()
  User.findOneAndUpdate(
    { email },
    { $set: { passwordResetToken: { exp } } },
    { new: true },
  ).exec()
    .then(user => {
      if (!user.emailVerifyToken) {
        const token = jwt.createToken({
          aud: 'password reset',
          sub: user.id,
          exp: user.passwordResetToken.exp,
          jti: user.passwordResetToken.id,
        })
        return mail.sendPasswordResetLink(email, token)
      } else {
        throw new Error('Email not validated')
      }
    })
    .then(() => res.sendStatus(200))
    .catch(error => {
      console.log(error)
      next(error)
    })
}

module.exports.setPassword = (req, res, next) => {
  const payload = req.payload
  User.findById(payload.sub)
    .then(user => {
      if (user.passwordResetToken && String(user.passwordResetToken._id) === payload.jti) {
        user.passwordResetToken = undefined
        user.refreshTokens = []
        return user.hashPassword(req.body.password)
      } else {
        throw new Error('Invalid token')
      }
    })
    .then(user => user.save())
    .then(() => res.sendStatus(200))
    .catch(error => {
      console.log(error)
      next(error)
    })
}
