const moment = require('moment')
const config = require('../../config')
const User = require('../../models/user')
const jwt = require('../../services/jwt')


module.exports = (req, res, next) => {
  const payload = req.payload
  User.findById(payload.sub)
    .then(user => {
      if (user.refreshTokens.some(rToken => String(rToken._id) === payload.jti)) {
        res.json({
          accessToken: jwt.createToken({
            aud: 'access',
            sub: user.id,
            exp: moment().add(...config.jwt.accessExpiry).valueOf(),
          }),
        })
      } else {
        res.status(422).send({ error: 'Invalid token' })
      }
    })
    .catch(next)
}
