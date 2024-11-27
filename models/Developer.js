const mongoose = require('mongoose') 
const Game = require('./Game') 
const Comment = require('./Comment') 

const developerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  founder: { type: String, required: true },
  founded: { type: Date, required: true },
  headquarters: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  photo: { type: Buffer, required: true },
  description: { type: String, required: true },
},{versionKey: false }) 

developerSchema.pre('findOneAndDelete', async function (next) {
  const developerId = this.getQuery()["_id"] 
  const games = await Game.find({ developerId }) 

  for (const game of games) {
    await Comment.deleteMany({ gameId: game._id }) 
  }

  await Game.deleteMany({ developerId }) 
  next() 
}) 


module.exports = mongoose.model('Developer', developerSchema) 
