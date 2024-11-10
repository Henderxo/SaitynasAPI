const Game = require('../models/Game') 
const { playerTypes, gameGenres, gamePlatforms } = require('../assets/enums') 
const Developer = require('../models/Developer')
const mongoose = require('mongoose')


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
      res.json(games)
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
      res.json(games)
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
    res.json(game) 

  } catch (error) {
    res.status(500).json({ error: 'Server error' }) 
  }
} 

// POST a new game
exports.createGame = async (req, res) => {
  try {
    const {
      title, genre, platform, controllerSupport,
      language, playerType, developerId
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
      developerId 
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
      language, playerType, developerId
    } = req.body 

    

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ error: 'Game not found' })
    }

    if (!mongoose.Types.ObjectId.isValid(developerId)) {
      return res.status(404).json({ error: 'Developer not found' })
    }

    if(!title || !genre || !platform || !controllerSupport || !language || !playerType || !developerId){
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

    const updatedGame = await Game.findByIdAndUpdate(
      req.params.id,
      { title, genre, platform, controllerSupport, language, playerType, developerId },
      { new: true, runValidators: true } 
    ) 

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
