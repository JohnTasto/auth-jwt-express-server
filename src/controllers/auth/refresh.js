const moment = require('moment')
const config = require('../../config')
const User = require('../../models/user')
const jwt = require('../../services/jwt')


module.exports = (req, res, next) => {
  const { payload: { sub, jti } } = req
  const now = moment().unix()

  Promise.resolve()
    .then(() =>
      User.findOneAndUpdate(
        {
          _id: sub,
          refreshTokens: { $elemMatch: { jti: jti } },
          verifyEmailToken: { $exists: false },
        },
        { $pull: { refreshTokens:
          { exp: { $lt: now } } },  // do a little maintenance
        },
      ).exec()
    )
    .then(user => {
      if (user) {
        res.json({
          accessToken: jwt.createToken({
            aud: 'access',
            sub: user.id,
            exp: jwt.expiry(config.jwt.accessExpiry),
          }),
        })
      } else {
        res.status(401).send('Invalid token')
      }
    })
    .catch(error => {
      console.log(error)
      next(error)
    })
}
