const mongoose = require('mongoose') 
const { playerTypes, gameGenres, gamePlatforms } = require('../assets/enums') 
const Comment = require('./Comment') 

const gameSchema = new mongoose.Schema({
  title: { type: String, required: true },
  genre: { type: String, enum: Object.values(gameGenres), required: true },
  platform: { type: String, required: true },
  controllerSupport: { type: Boolean, required: true },
  language: { type: String, required: true },
  playerType: { type: String, enum: Object.values(playerTypes), required: true },
  developerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Developer', required: true },
  photo: { type: Buffer, required: true },
  description: { type: String, required: true },
},{versionKey: false }) 


gameSchema.pre('findOneAndDelete', async function (next) {
  const gameId = this.getQuery()["_id"] 
  await Comment.deleteMany({ gameId })
  next() 
}) 

module.exports = mongoose.model('Game', gameSchema) 