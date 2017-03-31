const config = require('../config')
const mailgun = require('mailgun-js')(config.mailgun)


const sendMail = message =>
  new Promise((resolve, reject) => {
    mailgun.messages().send(message, (error, body) => {
      if (error) reject(error)
      resolve(body)
    })
  })

module.exports.sendEmailVerificationLink = (email, token) => {
  const message = {
    from: `Auth JWT <machine@${config.hostname}>`,
    to: email,
    subject: 'Verify your email',
    text: 'Follow this link to verify your email and activate your account:' +
          `${config.rootURL}/verify/${token}`,
  }
  return sendMail(message)
}

module.exports.sendPasswordResetLink = (email, token) => {
  const expiry = `${config.jwt.passwordResetExpiry[0]} ${config.jwt.passwordResetExpiry[1]}`
  const message = {
    from: `Auth JWT <machine@${config.hostname}>`,
    to: email,
    subject: 'Reset your password',
    text: 'Follow this link to reset your password:' +
          `${config.rootURL}/verify/${token}` +
          'If you did not request this you can safely ignore it.' +
          `This link will expire in ${expiry}.`,
  }
  return sendMail(message)
}
