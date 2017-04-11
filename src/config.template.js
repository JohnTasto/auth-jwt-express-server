/* eslint-disable key-spacing */

module.exports = {
  rootURL: process.env.ROOT_URL || 'http://localhost:9090',
  hostname: process.env.HOSTNAME || 'localhost',
  port: process.env.PORT || 9090,
  mongoURI: process.env.MONGO_URI || 'mongodb://localhost/auth',
  jwt: {
    secret: process.env.JWT_SECRET || '123456', // put something long and random here
    refreshExpiry:       [7,  'days'],
    accessExpiry:        [15, 'minutes'],
    emailVerifyExpiry:   [1,  'days'],
    resetPasswordExpiry: [1,  'hours'],
  },
  mailgun: {
    apiKey: process.env.MAILGUN_API_KEY || 'key-123456',
    domain: process.env.MAILGUN_DOMAIN || 'sandbox123456.mailgun.org',
  },
}
