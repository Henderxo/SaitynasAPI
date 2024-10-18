const Comment = require('../models/Comment') 
const User = require('../models/User') 
const Game = require('../models/Game')
const mongoose = require('mongoose')


// GET all comments for a specific game
exports.getCommentsByGame = async (req, res) => {
  try {
    const { expand } = req.query 
    if (!mongoose.Types.ObjectId.isValid(req.params.gameId)) {
      return res.status(404).json({ error: 'Game not found' })
    }
    let commentsQuery = Comment.find({ gameId: req.params.gameId })
    if(expand && expand.includes('gameId')){
      commentsQuery = commentsQuery.populate('gameId')
    }

    if(expand && expand.includes('userId')){
      commentsQuery = commentsQuery.populate('userId')
    }
    const comments = await commentsQuery 
    res.json(comments) 
  } catch (error) {
    res.status(500).json({ error: 'Server error' }) 
  }
} 
// GET all comments
exports.getAllComments = async (req, res) => {
  try {
    const { expand } = req.query 
    let commentsQuery = Comment.find() 

    if(expand && expand.includes('gameId')){
      commentsQuery = commentsQuery.populate('gameId')
    }

    if(expand && expand.includes('userId')){
      commentsQuery = commentsQuery.populate('userId')
    }
    const comments = await commentsQuery 
    res.json(comments) 
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: 'Server error' }) 
  }
} 

// GET a single comment by ID
exports.getCommentById = async (req, res) => {
  try {
    const { expand } = req.query 
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ error: 'Comment not found' })
    }
    let commentQuery = Comment.findById(req.params.id)

    if(expand && expand.includes('gameId')){
      commentsQuery = commentsQuery.populate('gameId')
    }

    if(expand && expand.includes('userId')){
      commentsQuery = commentsQuery.populate('userId')
    }

    const comment = await commentQuery
    if (comment) {
      res.json(comment) 
    } else {
      res.status(404).json({ error: 'Comment not found' }) 
    }
  } catch (error) {
    res.status(500).json({ error: 'Server error' }) 
  }
} 

// POST a new comment
exports.createComment = async (req, res) => {
  try {
    const { title, body, gameId, userId } = req.body 

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(404).json({ error: 'User not found' })
    }

    if (!mongoose.Types.ObjectId.isValid(gameId)) {
      return res.status(404).json({ error: 'Game not found' })
    }

    const user = await User.findById(userId) 
    if (!user) {
      return res.status(404).json({ error: 'User not found' }) 
    }

    const game = await Game.findById(gameId) 
    if (!game) {
      return res.status(404).json({ error: 'Game not found' }) 
    }

    const newComment = new Comment({
      title,
      body,
      gameId,
      userId,
      created_at: new Date()
    }) 

    await newComment.save() 
    res.status(201).json(newComment) 
  } catch (error) {
    res.status(500).json({ error: 'Error creating comment' })
  }
} 

// PUT (update) an existing comment
exports.updateComment = async (req, res) => {
  try {
    const { title, body, gameId, userId } = req.body 
    if(!title || !body || !gameId || !userId ){
      return res.status(400).json({ error: 'Need all fields' }) 
    }
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ error: 'Comment not found' })
    }
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(404).json({ error: 'User not found' })
    }
    if (!mongoose.Types.ObjectId.isValid(gameId)) {
      return res.status(404).json({ error: 'Game not found' })
    }

    const user = await User.findById(userId) 
    if (!user) {
      return res.status(404).json({ error: 'User not found' }) 
    }

    const game = await Game.findById(gameId) 
    if (!game) {
      return res.status(404).json({ error: 'Game not found' }) 
    }
    
    const updatedComment = await Comment.findByIdAndUpdate(
      req.params.id,
      { title, body },
      { new: true }

    ) 

    if (updatedComment) {
      res.json(updatedComment) 
    } else {
      res.status(404).json({ error: 'Comment not found' }) 
    }
  } catch (error) {
    res.status(500).json({ error: 'Error updating comment' }) 
  }
} 

// DELETE a comment
exports.deleteComment = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ error: 'Comment not found' })
    }
    const deletedComment = await Comment.findByIdAndDelete(req.params.id) 
    if (deletedComment) {
      res.json(deletedComment) 
    } else {
      res.status(404).json({ error: 'Comment not found' }) 
    }
  } catch (error) {
    res.status(500).json({ error: 'Server error' }) 
  }
} 
