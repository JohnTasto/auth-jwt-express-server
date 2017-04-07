const moment = require('moment')
const config = require('../../config')
const User = require('../../models/user')
const jwt = require('../../services/jwt')


module.exports = (req, res, next) => {
  const payload = req.payload
  const now = moment().valueOf()
  Promise.resolve()
    .then(() =>
      User.findByIdAndUpdate(
        payload.sub,
        { $pull: { refreshTokens:
          { exp: { $lt: now } } },  // do a little maintenance
        },
      ).exec()
    )
    .then(user => {
      if (user.refreshTokens.some(rToken => rToken.jti === payload.jti)) {
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
