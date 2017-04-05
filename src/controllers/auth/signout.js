const moment = require('moment')
const User = require('../../models/user')


module.exports = (req, res, next) => {
  const payload = req.payload
  User.findById(payload.sub)
    .then(user => {
      // might as well clear out any expired tokens since we're here....
      const now = moment().valueOf()
      user.refreshTokens.forEach(rToken => {
        if (rToken.id === payload.jti || now <= payload.exp) {
          rToken.remove()
        }
      })
      return user.save()
    })
    .then(() => res.sendStatus(200))
    .catch(next)
}
