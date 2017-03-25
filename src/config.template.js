module.exports = {
  jwtSecret: process.env.JWT_SECRET || '123456', // put something long and random here
  mailgun: {
    apiKey: process.env.MAILGUN_API_KEY || 'key-123456',
    domain: process.env.MAILGUN_DOMAIN || 'sandbox123456.mailgun.org',
  },
}
