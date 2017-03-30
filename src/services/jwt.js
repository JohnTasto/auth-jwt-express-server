const jwt = require('jwt-simple')
const moment = require('moment')
const uuid = require('uuid').v4
const config = require('../config')


// iss = issuer
// sub = subject
// aud = audience
// exp = expiration
// nbf = not before
// iat = issued at
// jti = JWT ID


const createTokenWithID = (user, type) => {
  const exp = moment().add(...config.jwt[`${type}Expiry`]).valueOf()
  const jti = uuid()
  const token = jwt.encode({ sub: user.id, aud: type, exp, jti }, config.jwt.secret)
  return { token, exp, jti }
}


exports.createEmailVerifyToken = user => createTokenWithID(user, 'emailVerify')

exports.createRefreshToken = user => createTokenWithID(user, 'refresh')

exports.createAccessToken = user => {
  const exp = moment().add(...config.jwt.accessExpiry).valueOf()
  const token = jwt.encode({ sub: user.id, aud: 'access', exp }, config.jwt.secret)
  return { token }
}

exports.createPasswordResetToken = user => createTokenWithID(user, 'passwordReset')
