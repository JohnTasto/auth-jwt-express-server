const uuid = require('uuid')
const config = require('../../config')
const User = require('../../models/user')
const jwt = require('../../services/jwt')
const mail = require('../../services/mail')


module.exports.sendToken = (req, res, next) => {
  const email = req.body.email

  const tokenPayload = {
    aud: 'password reset',
    exp: jwt.expiry(config.jwt.passwordResetExpiry),
    jti: uuid.v4(),
  }

  Promise.resolve()
    .then(() =>
      User.findOneAndUpdate(
        {
          email,
          emailVerifyToken: { $exists: false },
        },
        {
          $set: { passwordResetToken: {
            exp: tokenPayload.exp,
            jti: tokenPayload.jti,
          } },
        },
      ).exec()
    )
    .then(user => {
      const token = jwt.createToken({ sub: user.id, ...tokenPayload })
      return mail.sendPasswordResetLink(email, token)
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
          'passwordResetToken.jti': payload.jti,
          emailVerifyToken: { $exists: false },
        },
        {
          $set: {
            password: hashedPassword,
            unhashedPassword: password,
            resetTokens: [],
          },
          $unset: {
            passwordResetToken: '',
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
