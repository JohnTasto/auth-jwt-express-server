const signup = require('./controllers/auth/signup')
const signin = require('./controllers/auth/signin')
const signout = require('./controllers/auth/signout')
const refresh = require('./controllers/auth/refresh')
const Feature = require('./controllers/feature')
const passport = require('passport')
require('./services/passport')

// don't create sessions since we're authenticating with JWTs every time
const requireLocalSignin = passport.authenticate('local signin', { session: false })
const requireRefreshToken = passport.authenticate('refresh token', { session: false })
const requireAccessToken = passport.authenticate('access token', { session: false })

module.exports = app => {
  app.post('/signup', signup)
  app.post('/signin', requireLocalSignin, signin)
  app.post('/signout', requireRefreshToken, signout)
  app.post('/refresh', requireRefreshToken, refresh)
  app.get('/feature', requireAccessToken, Feature.feature)
}
