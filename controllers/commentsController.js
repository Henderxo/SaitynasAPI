const Comment = require('../models/Comment') 
const User = require('../models/User') 
const Game = require('../models/Game')

// GET all comments for a specific game
exports.getCommentsByGame = async (req, res) => {
  try {
    const { expand } = req.query 
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
    res.status(400).json({ error: 'Bad request' }) 
  }
} 

// PUT (update) an existing comment
exports.updateComment = async (req, res) => {
  try {
    const { title, body, gameId, userId } = req.body 

    if (userId) {
      const user = await User.findById(userId) 
      if (!user) {
        return res.status(404).json({ error: 'User not found' }) 
      }
    }

    if (gameId) {
      const game = await Game.findById(gameId) 
      if (!game) {
        return res.status(404).json({ error: 'Game not found' }) 
      }
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
    res.status(400).json({ error: 'Bad request' }) 
  }
} 

// DELETE a comment
exports.deleteComment = async (req, res) => {
  try {
    const deletedComment = await Comment.findByIdAndDelete(req.params.id) 
    if (deletedComment) {
      res.json(deletedComment) 
    } else {
      res.status(404).json({ error: 'Comment not found' }) 
    }
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: 'Server error' }) 
  }
} 
