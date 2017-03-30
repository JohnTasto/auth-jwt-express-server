/* eslint-disable key-spacing */

module.exports = {
  jwt: {
    secret: process.env.JWT_SECRET || '123456', // put something long and random here
    refreshExpiry:       [7,  'days'],
    accessExpiry:        [15, 'minutes'],
    emailVerifyExpiry:   [1,  'days'],
    passwordResetExpiry: [1,  'hours'],
  },
  mailgun: {
    apiKey: process.env.MAILGUN_API_KEY || 'key-123456',
    domain: process.env.MAILGUN_DOMAIN || 'sandbox123456.mailgun.org',
  },
}
