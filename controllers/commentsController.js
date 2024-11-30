const Comment = require('../models/Comment') 
const User = require('../models/User') 
const Game = require('../models/Game')
const mongoose = require('mongoose')
const Developer = require('../models/Developer')


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

    if (expand && expand.includes('userId')) {
      commentsQuery = commentsQuery.populate({
        path: 'userId',
        select: 'username email photo', // Select only necessary fields
        transform: (doc) => {
          if (doc && doc.photo) {
            return {
              ...doc.toObject(),
              photo: doc.photo.toString('base64') // Convert buffer to Base64
            };
          }
          return doc;
        }
      });
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

    if (expand && expand.includes('gameId')) {
      commentsQuery = commentsQuery.populate({
        path: 'gameId',
        select: 'title genre platform photoBase64', // Use the virtual field
      });
    }

    if (expand && expand.includes('userId')) {
      commentsQuery = commentsQuery.populate({
        path: 'userId',
        select: 'username email photo', // Select only necessary fields
        transform: (doc) => {
          if (doc && doc.photo) {
            return {
              ...doc.toObject(),
              photo: doc.photo.toString('base64') // Convert buffer to Base64
            };
          }
          return doc;
        }
      });
    }
    const comments = await commentsQuery 
    res.json(comments) 
  } catch (error) {
    res.status(500).json({ error: 'Server error' }) 
  }
} 

// GET a single comment by ID
// GET a single comment by ID
exports.getCommentById = async (req, res) => {
  try {
    const { expand } = req.query;

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    // Start building the query
    let commentQuery = Comment.findById(req.params.id);

    // Expand gameId if requested
    if (expand && expand.includes('gameId')) {
      commentQuery = commentQuery.populate('gameId');
    }

    // Expand userId if requested
    if (expand && expand.includes('userId')) {
      commentQuery = commentQuery.populate({
        path: 'userId',
        select: 'username email photo', // Only include these fields
        transform: (doc) => {
          if (doc && doc.photo) {
            return {
              ...doc.toObject(),
              photo: doc.photo.toString('base64'), // Convert photo to base64
            };
          }
          return doc;
        },
      });
    }

    // Execute the query
    const comment = await commentQuery;

    if (comment) {
      res.json(comment); // Respond with the comment
    } else {
      res.status(404).json({ error: 'Comment not found' }); // Not found
    }
  } catch (error) {
    res.status(500).json({ error: 'Server error' }); // Catch unexpected errors
  }
};


// POST a new comment
exports.createComment = async (req, res) => {
  try {
    const { title, body, gameId } = req.body 
    const userId = req.user.id

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

    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    if (comment.userId.toString() !== req.user.id && req.user.type !== 'admin') {
      return res.status(403).json({ error: 'You do not have permission to delete this comment' });
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

    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    if (comment.userId.toString() !== req.user.id && req.user.type !== 'admin') {
      return res.status(403).json({ error: 'You do not have permission to delete this comment' });
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



exports.getSpecificComment = async (req, res) => {
  try {
    const { developerId, gameId, commentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(developerId) ||
        !mongoose.Types.ObjectId.isValid(gameId) ||
        !mongoose.Types.ObjectId.isValid(commentId)) {
      return res.status(404).json({ error: 'Invalid IDs provided' });
    }

    const developer = await Developer.findOne({ _id: developerId });
    if (!developer) {
      return res.status(404).json({ error: 'Developer not found' });
    }

    const game = await Game.findOne({ _id: gameId, developerId });
    if (!game) {
      return res.status(404).json({ error: 'Game not found for this developer' });
    }

    const comment = await Comment.findOne({ _id: commentId, gameId });
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found for this game' });
    }

    res.json(comment);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching the comment' });
  }
};
