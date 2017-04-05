const config = require('../../config')
const jwt = require('../../services/jwt')


// The router runs the Passport email/password authenticator as a gatekeeper to
// this function. If the request makes it here, it is ok to send back a token.
module.exports = (req, res, next) => {
  req.user.refreshTokens.push({ exp: jwt.expiry(config.jwt.refreshExpiry) })
  req.user.save()                        // TODO: should be findOneAndUpdate()
    .then(user => res.json({
      refreshToken: jwt.createToken({
        aud: 'refresh',
        sub: user.id,
        exp: user.refreshTokens[user.refreshTokens.length - 1].exp,
        jti: user.refreshTokens[user.refreshTokens.length - 1].id,
      }),
      accessToken: jwt.createToken({
        aud: 'access',
        sub: user.id,
        exp: jwt.expiry(config.jwt.accessExpiry),
      }),
    }))
    .catch(next)
}
