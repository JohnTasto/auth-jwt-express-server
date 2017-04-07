const moment = require('moment')
const User = require('../../models/user')


module.exports = (req, res, next) => {
  const payload = req.payload
  const now = moment().valueOf()
  Promise.resolve()
    .then(() =>
      User.findByIdAndUpdate(
        payload.sub,
        { $pull: { refreshTokens: { $or: [
          { jti: payload.jti },
          { exp: { $lt: now } },  // do a little maintenance
        ] } } }
      ).exec()
    )
    // no need to check if token was in db, user is trying to log out anyway...
    .then(() => res.sendStatus(200))
    .catch(next)
}
