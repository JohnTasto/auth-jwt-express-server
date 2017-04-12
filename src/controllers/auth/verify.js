const uuid = require('uuid')
const config = require('../../config')
const User = require('../../models/user')
const jwt = require('../../services/jwt')


module.exports.email = (req, res, next) => {
  const payload = req.payload

  const tokenTemplates = {
    refresh: {
      aud: 'refresh',
      exp: jwt.expiry(config.jwt.refreshExpiry),
      jti: uuid.v4(),
    },
    access: {
      aud: 'access',
      exp: jwt.expiry(config.jwt.accessExpiry),
    },
  }

  Promise.resolve()
    .then(() =>
      User.findOneAndUpdate(
        {
          _id: payload.sub,
          'verifyEmailToken.jti': payload.jti,
        },
        {
          $unset: {
            verifyEmailToken: '',
          },
          $push: {
            refreshTokens: {
              exp: tokenTemplates.refresh.exp,
              jti: tokenTemplates.refresh.jti,
            },
          },
        }
      ).exec()
    )
    .then(user => {
      if (user) {
        res.json({
          refreshToken: jwt.createToken({ sub: user.id, ...tokenTemplates.refresh }),
          accessToken: jwt.createToken({ sub: user.id, ...tokenTemplates.access }),
        })
      } else {
        res.status(401).send({ error: 'Invalid token' })
      }
    })
    .catch(error => {
      console.log(error)
      next(error)
    })
}
