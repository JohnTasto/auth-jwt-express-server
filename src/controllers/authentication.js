const User = require('../models/user')
const createAuthToken = require('../services/jwt').createAuthToken

const emailValidator = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i
const passwordValidator = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/


// The router runs the Passport email/password authenticator as a gatekeeper to
// this function. If the request makes it here, it is ok to send back a token.
exports.signin = function (req, res, next) {
  res.send({ token: createAuthToken(req.user) })
}


exports.signup = function (req, res, next) {
  const email = req.body.email
  const password = req.body.password

  if (!email)                      return res.status(422).send({ error: 'No email provided' })
  if (!emailValidator.test(email)) return res.status(422).send({ error: 'Malformed email' })

  User.findOne({ email: email }, function (err, existingUser) {
    if (err) { return next(err) }

    if (existingUser)                      return res.status(422).send({ error: 'Email is in use' })
    if (!password)                         return res.status(422).send({ error: 'No password provided' })
    if (!passwordValidator.test(password)) return res.status(422).send({ error: 'Insecure password' })

    const user = new User({
      email: email,
      password: password,
    })

    user.save(function (err) {
      if (err) { return next(err) }
      res.json({ token: createAuthToken(user) })
    })
  })
}
