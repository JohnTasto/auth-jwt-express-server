const config = require('../../config')
const User = require('../../models/user')
const jwt = require('../../services/jwt')


module.exports = (req, res, next) => {
  const payload = req.payload
  User.findById(payload.sub)
    .then(user => {
      if (user.refreshTokens.some(rToken => rToken.id === payload.jti)) {
        res.json({
          accessToken: jwt.createToken({
            aud: 'access',
            sub: user.id,
            exp: jwt.expiry(config.jwt.accessExpiry),
          }),
        })
      } else {
        res.status(401).send({ error: 'Invalid token' })
      }
    })
    .catch(next)
}
