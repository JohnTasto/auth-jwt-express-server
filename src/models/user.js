const mongoose = require('mongoose')
const Schema = mongoose.Schema
const bcrypt = require('bcryptjs')
const TokenSchema = require('./token')

const rounds = process.env.NODE_ENV === 'test' ? 1 : 10


const userSchema = new Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  password: String,
  refreshTokens: [TokenSchema],
  emailVerifyToken: TokenSchema,
  resetPasswordToken: TokenSchema,
})

userSchema.static('hashPassword', function (password) {
  return bcrypt.hash(password, rounds)
})

userSchema.method('comparePassword', function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password)
})


module.exports = mongoose.model('user', userSchema)
