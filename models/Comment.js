const mongoose = require('mongoose') 

const commentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  body: { type: String, required: true },
  gameId: { type: mongoose.Schema.Types.ObjectId, ref: 'Game', required: true }, 
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, 
  created_at: { type: Date, default: Date.now }
},{versionKey: false }) 

module.exports = mongoose.model('Comment', commentSchema) 