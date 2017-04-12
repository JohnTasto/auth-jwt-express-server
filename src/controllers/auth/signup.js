const uuid = require('uuid')
const config = require('../../config')
const User = require('../../models/user')
const jwt = require('../../services/jwt')
const mail = require('../../services/mail')

const emailValidator = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i
const passwordValidator = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/

// TODO: send email only and respond with 201 Created

module.exports = (req, res, next) => {
  const email = req.body.email
  const password = req.body.password

  if (!email)                            return res.status(422).send({ error: 'No email provided' })
  if (!emailValidator.test(email))       return res.status(422).send({ error: 'Malformed email' })
  if (!password)                         return res.status(422).send({ error: 'No password provided' })
  if (!passwordValidator.test(password)) return res.status(422).send({ error: 'Insecure password' })

  const tokenTemplate = {
    aud: 'verify email',
    exp: jwt.expiry(config.jwt.verifyEmailExpiry),
    jti: uuid.v4(),
  }

  User.hashPassword(req.body.password)
    .then(hashedPassword => {
      return User.findOneAndUpdate(
        {
          email,
          verifyEmailToken: { $exists: true },
        },
        {
          $set: {
            email,
            password: hashedPassword,
            verifyEmailToken: { exp: tokenTemplate.exp, jti: tokenTemplate.jti },
          },
        },
        {
          new: true,
          upsert: true,
        }
      ).exec()
    })
    .then(user => {
      const token = jwt.createToken({ sub: user.id, ...tokenTemplate })
      return mail.sendEmailVerificationLink(email, token)
    })
    .then(() => res.sendStatus(201))
    .catch(error => {
      if (error.code === 11000) {
        res.status(422).send({ error: 'Email already in use' })
      } else {
        console.log(error)
        next(error)
      }
    })
}
