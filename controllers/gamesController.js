const Game = require('../models/Game') 
const { playerTypes, gameGenres, gamePlatforms } = require('../assets/enums') 
const Developer = require('../models/Developer')

exports.getGamesByDeveloper = async (req, res) => {
  try {
    const { expand } = req.query 
    let gamesQuery = Game.find({ developerId: req.params.developerId }) 
    console.log(req.params.developerId)

    if (expand && expand.includes('developerId')) {
      gamesQuery = gamesQuery.populate('developerId') 
    }

    if (expand && expand.includes('userId')) {
      gamesQuery = gamesQuery.populate('userId') 
    }

    const games = await gamesQuery 
    res.json(games) 
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
    res.json(games) 
  } catch (error) {
    res.status(500).json({ error: 'Server error' }) 
  }
} 

// GET a single game by ID with developer info
exports.getGameById = async (req, res) => {
  try {
    const { expand } = req.query 
    let gameQuery = Game.findById(req.params.id) 

    if(expand && expand.includes('developerId')){
      gameQuery = gameQuery.populate('developerId')
    }

    const game = await gameQuery 
    if (game) {
      res.json(game) 
    } else {
      res.status(404).json({ error: 'Game not found' }) 
    }
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

    if (!Object.values(playerTypes).includes(playerType)) {
      return res.status(400).json({ error: 'Invalid player type.' }) 
    }
    if (!Object.values(gameGenres).includes(genre)) {
      return res.status(400).json({ error: 'Invalid game genre.' }) 
    }

    const developer = await Developer.findById(developerId) 
    if (!developer) {
      return res.status(404).json({ error: 'Developer not found.' }) 
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
    console.log(error)
    res.status(400).json({ error: 'Bad request' }) 
  }
} 

// PUT (update) an existing game
exports.updateGame = async (req, res) => {
  try {
    const {
      title, genre, platform, controllerSupport,
      language, playerType, developerId
    } = req.body 


    if (playerType && !Object.values(playerTypes).includes(playerType)) {
      return res.status(400).json({ error: 'Invalid player type.' }) 
    }
 
    if (genre && !Object.values(gameGenres).includes(genre)) {
      return res.status(400).json({ error: 'Invalid game genre.' }) 
    }
    if(developerId){
      const developer = await Developer.findById(developerId) 
      if (!developer) {
        return res.status(404).json({ error: 'Developer not found.' }) 
      }
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
    res.status(400).json({ error: 'Bad request' }) 
  }
} 

// DELETE a game
exports.deleteGame = async (req, res) => {
  try {
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
