const passport = require('passport')
const JwtStrategy = require('passport-jwt').Strategy
const ExtractJwt = require('passport-jwt').ExtractJwt
const config = require('../config')


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
  new JwtStrategy({ ...jwtOptions, audience: 'email verify' }, verify),
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
  'reset password token',
  new JwtStrategy({ ...jwtOptions, audience: 'reset password' }, verify),
)
