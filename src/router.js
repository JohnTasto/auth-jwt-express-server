const Authentication = require('./controllers/authentication')
const passportService = require('./services/passport')
const passport = require('passport')

// don't create sessions since we're authenticating with JWTs every time
const requireAuth = passport.authenticate('jwtAuth', { session: false })
const requireSignin = passport.authenticate('local', { session: false })

module.exports = function(app) {
  app.get('/', requireAuth, function(req, res) {
    res.send({ message: 'Super secret code is ABC123' })
  })
  app.post('/signin', requireSignin, Authentication.signin)
  app.post('/signup', Authentication.signup)
}
