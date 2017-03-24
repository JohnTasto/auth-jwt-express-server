const Authentication = require('./controllers/authentication')
const Feature = require('./controllers/feature')
const passport = require('passport')
require('./services/passport')

// don't create sessions since we're authenticating with JWTs every time
const requireAuth = passport.authenticate('jwtAuth', { session: false })
const requireSignin = passport.authenticate('local', { session: false })

module.exports = function (app) {
  app.get('/feature', requireAuth, Feature.feature)
  app.post('/signin', requireSignin, Authentication.signin)
  app.post('/signup', Authentication.signup)
}
