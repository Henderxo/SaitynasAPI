const mongoose = require('mongoose') 
const bcrypt = require('bcrypt') 
const Comment = require('./Comment') 
const Developer = require('./Developer')

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  created_at: { type: Date, default: Date.now },
  type: { type: String, enum: ['admin', 'dev', 'guest'], required: true },
  photo: { type: Buffer },
  refreshToken: { type: String }, // Add this field
}, { versionKey: false });
userSchema.pre('save', async function (next) {
  
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(10) 
    this.password = await bcrypt.hash(this.password, salt) 

  }
  next() 
}) 

userSchema.pre('findOneAndDelete', async function (next) {
  const userId = this.getQuery()["_id"] 
  await Comment.deleteMany({ userId }) 
  await Developer.deleteMany({ userId }) 
  next() 
}) 

module.exports = mongoose.model('User', userSchema) 