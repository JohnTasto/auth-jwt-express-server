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
  passReqToCallback: true,
}

const verify = (req, payload, done) => {
  req.payload = payload
  done(null, true)
}

passport.use(
  'email verify token',
  new JwtStrategy({ ...jwtOptions, audience: 'emailVerify' }, verify),
)

passport.use(
  'refresh token',
  new JwtStrategy({ ...jwtOptions, audience: 'refresh' }, verify),
)

passport.use(
  'access token',
  new JwtStrategy({ ...jwtOptions, audience: 'access' }, verify),
)

passport.use(
  'password reset token',
  new JwtStrategy({ ...jwtOptions, audience: 'passwordReset' }, verify),
)
