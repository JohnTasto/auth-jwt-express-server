/* eslint-env jest */

const mongoose = require('mongoose')
const app = require('../../app')

const User = mongoose.model('user')

test('test', () => {
  console.log('here')
})

test('test2', () => {
  console.log('here2')
})
