const mongoose = require('mongoose')
const Schema = mongoose.Schema


const tokenSchema = new Schema({
  exp: Number,
  jti: String,
})

module.exports = tokenSchema
