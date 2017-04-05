/* eslint-disable func-call-spacing, space-in-parens, comma-spacing */

const signup = require('./controllers/auth/signup')
const signin = require('./controllers/auth/signin')
const signout = require('./controllers/auth/signout')
const refresh = require('./controllers/auth/refresh')
const passwordReset = require('./controllers/auth/passwordReset')
const Feature = require('./controllers/feature')
const passport = require('passport')
require('./services/passport')

// don't create sessions since we're authenticating with JWTs every time
const requireLocalSignin = passport.authenticate('local signin', { session: false })
const requireRefreshToken = passport.authenticate('refresh token', { session: false })
const requireAccessToken = passport.authenticate('access token', { session: false })
const requirePasswordResetToken = passport.authenticate('password reset token', { session: false })

module.exports = app => {
  app.post  ('/signup'        ,                             signup)
  app.patch ('/signin'        , requireLocalSignin        , signin)
  app.patch ('/signout'       , requireRefreshToken       , signout)
  app.get   ('/refresh'       , requireRefreshToken       , refresh)
  app.get   ('/resetpassword' ,                             passwordReset.sendToken)
  app.patch ('/resetpassword' , requirePasswordResetToken , passwordReset.setPassword)
  app.get   ('/feature'       , requireAccessToken        , Feature.feature)
}
