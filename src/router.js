/* eslint-disable func-call-spacing, space-in-parens, comma-spacing */

const signup = require('./controllers/auth/signup')
const signin = require('./controllers/auth/signin')
const signout = require('./controllers/auth/signout')
const refresh = require('./controllers/auth/refresh')
const password = require('./controllers/auth/password')
const Feature = require('./controllers/feature')
const passport = require('passport')
require('./services/passport')

// don't create sessions since we're authenticating with JWTs every time
const requireRefreshToken = passport.authenticate('refresh token', { session: false })
const requireAccessToken = passport.authenticate('access token', { session: false })
const requireResetPasswordToken = passport.authenticate('reset password token', { session: false })

module.exports = app => {
  app.post  ('/signup'        ,                             signup)
  app.patch ('/signin'        ,                             signin)
  app.patch ('/signout'       , requireRefreshToken       , signout)
  app.get   ('/refresh'       , requireRefreshToken       , refresh)
  app.get   ('/resetpassword' ,                             password.sendResetToken)
  app.patch ('/resetpassword' , requireResetPasswordToken , password.reset)
  app.get   ('/feature'       , requireAccessToken        , Feature.feature)
}

// TODO: FIX SIGNIN TO SEND LAST REFRESH TOKEN - NOT FIRST!
//       change signup to send email only and respond with 201 Created
//       change signin to check if email is verified
//       try using findOneAndUpdate with the $push update operator for refresh tokens
//       try using findOneAndUpdate with the $set update operator for other tokens
