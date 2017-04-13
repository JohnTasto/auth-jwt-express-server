/* eslint-disable key-spacing */

module.exports = {
  port: process.env.PORT || 9090,
  mongoURI: process.env.MONGO_URI || 'mongodb://localhost/auth',
  jwt: {
    secret: process.env.JWT_SECRET || '123456', // put something long and random here
    refreshExpiry:       [7,  'days'],
    accessExpiry:        [15, 'minutes'],
    verifyEmailExpiry:   [24, 'hours'],
    resetPasswordExpiry: [30, 'minutes'],
  },
  mail: {
    from: process.env.MAIL_FROM || 'Auth JWT <machine@localhost>',
    linkRootURL: process.env.LINK_ROOT_URL || 'http://localhost:8080',
    mailgun: {
      apiKey: process.env.MAILGUN_API_KEY || 'key-123456',
      domain: process.env.MAILGUN_DOMAIN || 'sandbox123456.mailgun.org',
    },
  },
}
