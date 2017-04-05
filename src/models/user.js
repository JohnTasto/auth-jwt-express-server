const mongoose = require('mongoose')
const Schema = mongoose.Schema
const bcrypt = require('bcryptjs')
const TokenSchema = require('./token')

const rounds = process.env.NODE_ENV === 'test' ? 1 : 10


const userSchema = new Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  password: String,
  passwordHash: String,
  refreshTokens: [TokenSchema],
  emailVerifyToken: TokenSchema,
  passwordResetToken: TokenSchema,
})

userSchema.pre('save', function (next) {
  if (this.password) {
    console.time('hash')
    bcrypt.hash(this.password, rounds)
      .then(hash => {
        console.timeEnd('hash')
        this.passwordHash = hash
        this.password = undefined
        next()
      })
      .catch(next)
  } else {
    next()
  }
})

userSchema.method('comparePassword', function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash)
})


module.exports = mongoose.model('user', userSchema)
