const passport = require('passport')
const LocalStrategy = require('passport-local')
const JwtStrategy = require('passport-jwt').Strategy
const ExtractJwt = require('passport-jwt').ExtractJwt

const User = require('../models/user')
const config = require('../config')


const localOptions = { usernameField: 'email' }

passport.use('local signin', new LocalStrategy(localOptions, (email, password, done) => {
  User.findOne({ email: email }).exec()
    .then(user => {
      if (!user) return false
      return user.comparePassword(password)
        .then(isMatch => isMatch ? user : false)
    })
    .then(user => done(null, user))
    .catch(error => done(error))
}))


const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('Bearer'),
  secretOrKey: config.jwt.secret,
  algorithms: ['HS256'],
  ignoreExpiration: false,
}


passport.use('email verify token', new JwtStrategy(jwtOptions, (payload, done) => {
  done(null, payload.aud === 'emailVerify' ? payload.sub : false)
}))

passport.use('refresh token', new JwtStrategy(jwtOptions, (payload, done) => {
  if (payload.aud !== 'refresh') done(null, false)
  User.findById(payload.sub).exec()
    .then(user => user ? done(null, user) : done(null, false))
    .catch(error => done(error, false))
}))

passport.use('access token', new JwtStrategy(jwtOptions, (payload, done) => {
  done(null, payload.aud === 'access' ? payload.sub : false)
}))

passport.use('password reset token', new JwtStrategy(jwtOptions, (payload, done) => {
  done(null, payload.aud === 'passwordReset' ? payload.sub : false)
}))
