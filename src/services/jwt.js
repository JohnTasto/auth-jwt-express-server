const jwt = require('jwt-simple')
const config = require('../config')
const moment = require('moment')


// iss = issuer
// sub = subject
// aud = audience
// exp = expiration
// nbf = not before
// iat = issued at
// jti = JWT ID

module.exports.createToken = payload => jwt.encode(payload, config.jwt.secret)

module.exports.expiry = expiry => moment().add(...expiry).valueOf()
