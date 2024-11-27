const Game = require('../models/Game') 
const { playerTypes, gameGenres, gamePlatforms } = require('../assets/enums') 
const Developer = require('../models/Developer')
const mongoose = require('mongoose')
const { getMimeType } = require('../services/photoBuffer');

exports.getGamesByDeveloper = async (req, res) => {
  try {
    const { expand } = req.query 
    if (!mongoose.Types.ObjectId.isValid(req.params.developerId)) {
      return res.status(404).json({ error: 'Developer not found' })
    }
    let gamesQuery = Game.find({ developerId: req.params.developerId }) 

    if (expand && expand.includes('developerId')) {
      gamesQuery = gamesQuery.populate('developerId') 
    }

    if (expand && expand.includes('userId')) {
      gamesQuery = gamesQuery.populate('userId') 
    }

    const games = await gamesQuery
    if(games){
      const gamesWithPhotos = games.map(game => {
        const photoBase64 = game.photo ? game.photo.toString('base64') : null;
        return {
          ...game.toObject(),
          photo: photoBase64, // Only Base64 string, no MIME type
        };
      });
      res.json(gamesWithPhotos);
    } else{
      return res.status(404).json({ error: 'Game not found' })
    }
 
  } catch (error) {
    res.status(500).json({ error: 'Server error' }) 
  }
} 

// GET all games with developer info
exports.getAllGames = async (req, res) => {
  try {
    const { expand } = req.query 

    let gamesQuery = Game.find()
    
    if(expand && expand.includes('developerId')){
      gamesQuery = gamesQuery.populate('developerId')
    }

    const games = await gamesQuery
    if(games){
      const gamesWithPhotos = games.map(game => {
        const photoBase64 = game.photo ? game.photo.toString('base64') : null;
        return {
          ...game.toObject(),
          photo: photoBase64, // Only Base64 string, no MIME type
        };
      });
      res.json(gamesWithPhotos)
    } else{
      return res.status(404).json({ error: 'Game not found' })
    }
  } catch (error) {
    res.status(500).json({ error: 'Server error' }) 
  }
} 

// GET a single game by ID with developer info
exports.getGameById = async (req, res) => {
  try {
    const { expand } = req.query 

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ error: 'Game not found' })
    }

    let gameQuery = Game.findById(req.params.id) 
    if(expand && expand.includes('developerId')){
      gameQuery = gameQuery.populate('developerId')
    }

    const game = await gameQuery 
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }
    const photoBase64 = game.photo ? game.photo.toString('base64') : null;

    res.json({
      ...game.toObject(),
      photo: photoBase64, // Only Base64 string, no MIME type
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' }) 
  }
} 

// POST a new game
exports.createGame = async (req, res) => {
  try {
    const {
      title, genre, platform, controllerSupport,
      language, playerType, developerId, description
    } = req.body 


    if (!mongoose.Types.ObjectId.isValid(developerId)) {
      return res.status(404).json({ error: 'Developer not found' })
    }
    if (!Object.values(playerTypes).includes(playerType)) {
      return res.status(422).json({ error: 'Invalid player type.' }) 
    }
    if (!Object.values(gameGenres).includes(genre)) {
      return res.status(422).json({ error: 'Invalid game genre.' }) 
    }
    if(!req.file){
      return res.status(404).json({ error: 'Photo field is required' })
    }

    const developer = await Developer.findById(developerId) 
    if (!developer) {
      return res.status(404).json({ error: 'Developer not found.' }) 
    }

    if (req.user.id !== developer.userId.toString() && req.user.type !== 'admin') {
      return res.status(403).json({ error: 'You do not have permission to create this game' });
    }

    const newGame = new Game({
      title,
      genre,
      platform,
      controllerSupport,
      language,
      playerType,
      developerId,
      photo: req.file?.buffer,
      description
    }) 

    await newGame.save() 
    res.status(201).json(newGame) 
  } catch (error) {
    res.status(500).json({ error: 'Error creating game' })
  }
} 

// PUT (update) an existing game
exports.updateGame = async (req, res) => {
  try {
    const {
      title, genre, platform, controllerSupport,
      language, playerType, developerId, description
    } = req.body 

    

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ error: 'Game not found' })
    }

    if (!mongoose.Types.ObjectId.isValid(developerId)) {
      return res.status(404).json({ error: 'Developer not found' })
    }

    if(!title || !genre || !platform || !controllerSupport || !language || !playerType || !developerId || !req.file){
      return res.status(400).json({ error: 'Need all fields' }) 
    }
    if (playerType && !Object.values(playerTypes).includes(playerType)) {
      return res.status(422).json({ error: 'Invalid player type.' }) 
    }
 
    if (genre && !Object.values(gameGenres).includes(genre)) {
      return res.status(422).json({ error: 'Invalid game genre.' }) 
    }

    const developer = await Developer.findById(developerId) 
    if (!developer) {
      return res.status(404).json({ error: 'Developer not found.' }) 
    }

    if (req.user.id !== developer.userId.toString() && req.user.type !== 'admin') {
      return res.status(403).json({ error: 'You do not have permission to update this game' });
    }
    

    const updatedFields = { title, genre, platform, controllerSupport, language, playerType, developerId, description };
    updatedFields.photo = req.file.buffer;


    const updatedGame = await Game.findByIdAndUpdate(
      req.params.id,
      updatedFields,
      { new: true, runValidators: true }
    );

    if (updatedGame) {
      res.json(updatedGame) 
    } else {
      res.status(404).json({ error: 'Game not found' }) 
    }
  } catch (error) {
    res.status(500).json({ error: 'Error updating game' })
  }
} 

// DELETE a game
exports.deleteGame = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ error: 'Game not found' })
    }
    const game = await Game.findById(req.params.id).populate('developerId');
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }
    const developerUserId = game.developerId.userId.toString();
    if (req.user.id !== developerUserId && userType !== 'admin') {
      return res.status(403).json({ error: 'You do not have permission to delete this game' });
    }
    const deletedGame = await Game.findByIdAndDelete(req.params.id) 
    if (deletedGame) {
      res.json(deletedGame) 
    } else {
      res.status(404).json({ error: 'Game not found' }) 
    }
  } catch (error) {
    res.status(500).json({ error: 'Server error' }) 
  }
} 
