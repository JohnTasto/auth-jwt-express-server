const mongoose = require('mongoose')
const Schema = mongoose.Schema


const tokenSchema = new Schema({
  exp: { type: Number, index: true },
})

module.exports = tokenSchema
