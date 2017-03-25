const Authentication = require('./controllers/authentication')
const Feature = require('./controllers/feature')
const passport = require('passport')
require('./services/passport')

// don't create sessions since we're authenticating with JWTs every time
const requireSignin = passport.authenticate('local-signin', { session: false })
const requireAuth = passport.authenticate('jwt-auth', { session: false })

module.exports = app => {
  app.get('/feature', requireAuth, Feature.feature)
  app.post('/signin', requireSignin, Authentication.signin)
  app.post('/signup', Authentication.signup)
}
