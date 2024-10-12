require('dotenv').config();
const express = require('express') 
const mongoose = require('mongoose') 

const usersController = require('./controllers/usersController') 
const gamesController = require('./controllers/gamesController') 
const developersController = require('./controllers/developersController') 
const commentsController = require('./controllers/commentsController') 

mongoose.connect(process.env.MONGODB_URI, {})
  .then(() => console.log('Connected to MongoDB Atlas!'))
  .catch((error) => console.log('Error connecting to MongoDB:', error)) 

const app = express() 
const PORT = process.env.PORT || 3000 

app.use(express.json()) 

// User routes
app.get('/users', usersController.getAllUsers) 
app.get('/users/:id', usersController.getUserById) 
app.post('/users', usersController.createUser) 
app.put('/users/:id', usersController.updateUser) 
app.delete('/users/:id', usersController.deleteUser) 

// Game routes
app.get('/developers/games/:developerId', gamesController.getGamesByDeveloper)
app.get('/games', gamesController.getAllGames) 
app.get('/games/:id', gamesController.getGameById) 
app.post('/games', gamesController.createGame) 
app.put('/games/:id', gamesController.updateGame) 
app.delete('/games/:id', gamesController.deleteGame) 


// Developer routes
app.get('/developers', developersController.getAllDevelopers) 
app.get('/developers/:id', developersController.getDeveloperById) 
app.post('/developers', developersController.createDeveloper) 
app.put('/developers/:id', developersController.updateDeveloper) 
app.delete('/developers/:id', developersController.deleteDeveloper) 

// Comment routes
app.get('/comments', commentsController.getAllComments)
app.get('/games/comments/:gameId', commentsController.getCommentsByGame) 
app.get('/comments/:id', commentsController.getCommentById) 
app.post('/comments', commentsController.createComment) 
app.put('/comments/:id', commentsController.updateComment) 
app.delete('/comments/:id', commentsController.deleteComment) 

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`) 
}) 
