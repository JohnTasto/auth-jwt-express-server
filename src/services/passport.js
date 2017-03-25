const passport = require('passport')
const LocalStrategy = require('passport-local')
const JwtStrategy = require('passport-jwt').Strategy
const ExtractJwt = require('passport-jwt').ExtractJwt

const User = require('../models/user')
const config = require('../config')


const localOptions = { usernameField: 'email' }

passport.use('local-signin', new LocalStrategy(localOptions, function (email, password, done) {
  User.findOne({ email: email }, function (err, user) {
    if (err) { return done(err) }
    if (!user) { return done(null, false) }

    user.comparePassword(password, function (err, isMatch) {
      if (err) { return done(err) }
      if (!isMatch) { return done(null, false) }

      return done(null, user)
    })
  })
}))


const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('Bearer'),
  secretOrKey: config.jwtSecret,
  algorithms: ['HS256'],
}

passport.use('jwt-auth', new JwtStrategy(jwtOptions, function (payload, done) {
  User.findById(payload.sub, function (err, user) {
    if (err) { return done(err, false) }

    if (user) {
      done(null, user)
    } else {
      done(null, false)
    }
  })
}))
