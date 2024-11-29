const { rawListeners } = require('../models/Comment')
const Developer = require('../models/Developer') 
const User = require('../models/User')
const Game = require('../models/Game')
const Comment = require('../models/Comment')
const mongoose = require('mongoose')
const { getMimeType } = require('../services/photoBuffer');

// GET all developers
exports.getAllDevelopers = async (req, res) => {
  try {
    const { expand } = req.query 
    let developersQuery = Developer.find()

    if(expand && expand.includes('userId')){
      developersQuery - developersQuery.populate('userId')
    }

    const developers = await developersQuery;
    const developersWithPhotos = developers.map(developer => {
      const photoBase64 = developer.photo ? developer.photo.toString('base64') : null;
      return {
        ...developer.toObject(),
        photo: photoBase64, // Only Base64 string, no MIME type
      };
    });


    res.json(developersWithPhotos) 
  } catch (error) {
    res.status(500).json({ error: 'Server error' }) 
  }
} 


exports.getCommentsByDeveloper = async (req, res) => {
  try {
    const { developerId } = req.params;
    const { expand } = req.query;
    if (!mongoose.Types.ObjectId.isValid(developerId)) {
      return res.status(404).json({ error: 'Developer not found' })
    }
    const games = await Game.find({ developerId });

    const gameIds = games.map(game => game._id);

    let commentsQuery = Comment.find({ gameId: { $in: gameIds } });

    if (expand && expand.includes('gameId')) {
      commentsQuery = commentsQuery.populate('gameId');
    }

    if (expand && expand.includes('userId')) {
      commentsQuery = commentsQuery.populate('userId');
    }
    const comments = await commentsQuery;

    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: 'Server error fetching comments for developer' });
  }
};

// GET a single developer by ID
exports.getDeveloperById = async (req, res) => {
  try {
    const { expand } = req.query
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ error: 'Developer not found' })
    }
    let developersQuery = Developer.findById(req.params.id)

    if(expand && expand.includes('userId')){
      developersQuery - developersQuery.populate('userId')
    }
    const developer = await developersQuery;

    if (developer) {
      const photoBase64 = developer.photo ? developer.photo.toString('base64') : null;

      res.json({
        ...developer.toObject(),
        photo: photoBase64, // Only Base64 string, no MIME type
      });
    } else {
      res.status(404).json({ error: 'Developer not found' }) 
    }
  } catch (error) {
    res.status(500).json({ error: 'Server error' }) 
  }
} 

// POST a new developer
exports.createDeveloper = async (req, res) => {
  try {
    const { name, founder, founded, headquarters, userId, description } = req.body 
    if(!req.file){
      return res.status(404).json({ error: 'Photo is required' })
    }
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(404).json({ error: 'User not found' })
    }
    console.log(req.file)

    const user = await User.findById(userId) 
    if (!user) {
      return res.status(404).json({ error: 'User not found' }) 
    }

    const newDeveloper = new Developer({
      name,
      founder,
      founded,
      headquarters,
      userId,
      photo: req.file?.buffer,
      description
    }) 



    await newDeveloper.save()  
    res.status(201).json(newDeveloper) 
  } catch (error) {
    res.status(500).json({ error: 'Server error' }) 
  }
} 

// PUT (update) an existing developer
exports.updateDeveloper = async (req, res) => {
  try {
    const {
      name, founder, founded, headquarters,
      userId, description, photo
    } = req.body 
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ error: 'Developer not found' })
    }
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(404).json({ error: 'User not found' })
    }
    if(!name || !founder || !founded || !headquarters || !userId || !(req.file||photo) || !description){
      return res.status(400).json({ error: 'Need all fields' }) 
    }

    const user = await User.findById(req.body.userId) 
    if (!user) {
      return res.status(404).json({ error: 'User not found' }) 
    }

    const developer = await Developer.findById(req.params.id);
    if (!developer) {
      return res.status(404).json({ error: 'Developer not found' });
    }

    if (userId && userId !== developer.userId.toString()) {
      if (req.user.type !== 'admin') {
        return res.status(403).json({ error: 'You do not have permission to change the user controlling this developer' });
      }
    }

    if (req.user.id !== developer.userId.toString() && req.user.type !== 'admin') {
      return res.status(403).json({ error: 'You do not have permission to update this developer' });
    }

    const updatedFields = { name, founder, founded, headquarters, userId, description };
    updatedFields.photo = req.file?req.file.buffer:Buffer.from(photo, 'base64');


    const updatedDeveloper = await Developer.findByIdAndUpdate(
      req.params.id,
      updatedFields,
      { new: true, runValidators: true }
    ) 

    if (updatedDeveloper) {
      res.json(updatedDeveloper) 
    } else {
      res.status(404).json({ error: 'Developer not found' }) 
    }
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: 'Bad request' }) 
  }
} 

// DELETE a developer
exports.deleteDeveloper = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ error: 'Developer not found' })
    }

    const developer = await Developer.findById(req.params.id);
    if (!developer) {
      return res.status(404).json({ error: 'Developer not found' });
    }

    if (req.user.id !== developer.userId.toString() && req.user.type !== 'admin') {
      return res.status(403).json({ error: 'You do not have permission to delete this developer' });
    }

    const deletedDeveloper = await Developer.findByIdAndDelete(req.params.id) 

    if (deletedDeveloper) {
      res.json(deletedDeveloper) 
    } else {
      res.status(404).json({ error: 'Developer not found' }) 
    }
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: 'Server error' }) 
  }
} 
