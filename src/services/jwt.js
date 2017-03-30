const jwt = require('jwt-simple')
const config = require('../config')


// iss = issuer
// sub = subject
// aud = audience
// exp = expiration
// nbf = not before
// iat = issued at
// jti = JWT ID

exports.createToken = payload => jwt.encode(payload, config.jwt.secret)
