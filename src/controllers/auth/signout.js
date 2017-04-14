const moment = require('moment')
const User = require('../../models/user')


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
        { $pull: { refreshTokens: { $or: [
          { jti: jti },
          { exp: { $lt: now } },  // do a little maintenance
        ] } } }
      ).exec()
    )
    .then(user => {
      if (user) {
        res.sendStatus(200)
      } else {
        res.status(401).send('Invalid token')
      }
    })
    .catch(error => {
      console.log(error)
      next(error)
    })
}
