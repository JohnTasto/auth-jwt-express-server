const signup = require('./controllers/auth/signup')
const signin = require('./controllers/auth/signin')
const Feature = require('./controllers/feature')
const passport = require('passport')
require('./services/passport')

// don't create sessions since we're authenticating with JWTs every time
const requireLocalSignin = passport.authenticate('local signin', { session: false })
const requireAccessToken = passport.authenticate('access token', { session: false })

module.exports = app => {
  app.get('/feature', requireAccessToken, Feature.feature)
  app.post('/signin', requireLocalSignin, signin)
  app.post('/signup', signup)
}
