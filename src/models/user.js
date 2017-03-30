const mongoose = require('mongoose')
const Schema = mongoose.Schema
const bcrypt = require('bcryptjs')
const TokenSchema = require('./token')

const rounds = process.env.NODE_ENV === 'test' ? 1 : 10


const userSchema = new Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  passwordHash: String,
  refreshTokens: [TokenSchema],
  emailVerifyToken: TokenSchema,
  passwordResetToken: TokenSchema,
})

userSchema.method('hashPassword', function (password) {
  return bcrypt.hash(password, rounds)
    .then(hash => {
      this.passwordHash = hash
      return this
    })
})

userSchema.method('comparePassword', function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash)
})


module.exports = mongoose.model('user', userSchema)
