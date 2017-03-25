const User = require('../models/user')
const createAuthToken = require('../services/jwt').createAuthToken

const emailValidator = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i
const passwordValidator = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/


class ValidationError extends Error {
  constructor(message) {
    super(message)
    this.name = 'ValidationError'
  }
}


// The router runs the Passport email/password authenticator as a gatekeeper to
// this function. If the request makes it here, it is ok to send back a token.
exports.signin = (req, res, next) => {
  res.send({ token: createAuthToken(req.user) })
}


exports.signup = (req, res, next) => {
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
      return User.create({
        email: email,
        password: password,
      })
    })
    .then(user => res.json({ token: createAuthToken(user) }))
    .catch(error => {
      if (error instanceof ValidationError) {
        res.status(422).send({ error: error.message })
      } else {
        next(error)
      }
    })
}
