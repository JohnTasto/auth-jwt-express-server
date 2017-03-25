const jwt = require('jwt-simple')
const config = require('../config')


exports.createAuthToken = user => {
  const timestamp = new Date().getTime()

  // sub = subject, iat = issued at time
  return jwt.encode({ sub: user.id, iat: timestamp }, config.jwtSecret)
}
