const mongoose = require('mongoose')
const Schema = mongoose.Schema
const bcrypt = require('bcryptjs')

const rounds = process.env.NODE_ENV === 'test' ? 1 : 10


const userSchema = new Schema({
  email: { type: String, unique: true, lowercase: true },
  password: String,
})

userSchema.pre('save', function (next) {
  bcrypt.hash(this.password, rounds)
    .then(hash => {
      this.password = hash
      return next()
    })
    .catch(err => next(err))
})

userSchema.method('comparePassword', function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password)
})


module.exports = mongoose.model('user', userSchema)
