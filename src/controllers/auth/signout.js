const moment = require('moment')
const User = require('../../models/user')


module.exports = (req, res, next) => {
  const payload = req.payload
  const now = moment().unix()
  Promise.resolve()
    .then(() =>
      User.findOneAndUpdate(
        {
          _id: payload.sub,
          refreshTokens: { $elemMatch: { jti: payload.jti } },
          verifyEmailToken: { $exists: false },
        },
        { $pull: { refreshTokens: { $or: [
          { jti: payload.jti },
          { exp: { $lt: now } },  // do a little maintenance
        ] } } }
      ).exec()
    )
    .then(user => {
      if (user) {
        res.sendStatus(200)
      } else {
        res.status(401).send({ error: 'Invalid token' })
      }
    })
    .catch(error => {
      console.log(error)
      next(error)
    })
}
