const config = require('../config')
const mailgun = require('mailgun-js')(config.mail.mailgun)


const sendMail = message =>
  new Promise((resolve, reject) => {
    mailgun.messages().send(message, (error, body) => {
      if (error) reject(error)
      resolve(body)
    })
  })

module.exports.sendEmailVerificationLink = (email, token) => {
  const expiry = `${config.jwt.verifyEmailExpiry[0]} ${config.jwt.verifyEmailExpiry[1]}`
  const message = {
    from: config.mail.from,
    to: email,
    subject: 'Verify your email',
    text: 'Follow this link to verify your email and activate your account:\n\n' +
          `${config.mail.linkRootURL}/verifyemail/${token}\n\n` +
          'If you did not request this you can safely ignore it.\n' +
          `This link will expire in ${expiry}.`,
  }
  return sendMail(message)
}

module.exports.sendResetPasswordLink = (email, token) => {
  const expiry = `${config.jwt.resetPasswordExpiry[0]} ${config.jwt.resetPasswordExpiry[1]}`
  const message = {
    from: config.mail.from,
    to: email,
    subject: 'Reset your password',
    text: 'Follow this link to reset your password:\n\n' +
          `${config.mail.linkRootURL}/resetpassword/${token}\n\n` +
          'If you did not request this you can safely ignore it.\n' +
          `This link will expire in ${expiry}.`,
  }
  return sendMail(message)
}
