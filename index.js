require('dotenv').config();
const express = require('express') 
const mongoose = require('mongoose')
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path'); 

const usersController = require('./controllers/usersController') 
const gamesController = require('./controllers/gamesController') 
const developersController = require('./controllers/developersController') 
const commentsController = require('./controllers/commentsController') 
const usersApiSpec = YAML.load(path.join(__dirname, './OpenApi/userOpenApi.yml'));
const commentsApiSpec = YAML.load(path.join(__dirname, './OpenApi/commentsOpenApi.yml'));
const developersApiSpec = YAML.load(path.join(__dirname, './OpenApi/developerOpenApi.yml'));
const gamesApiSpec = YAML.load(path.join(__dirname, './OpenApi/gamesOpenApi.yml'));

mongoose.connect(process.env.MONGODB_URI, {})
  .then(() => console.log('Connected to MongoDB Atlas!'))
  .catch((error) => console.log('Error connecting to MongoDB:', error)) 

const app = express() 
const PORT = process.env.PORT || 3000 

app.use(express.json()) 


app.use('/api-docs/users', swaggerUi.serve, swaggerUi.setup(usersApiSpec));
app.use('/api-docs/comments', swaggerUi.serve, swaggerUi.setup(commentsApiSpec));
app.use('/api-docs/developers', swaggerUi.serve, swaggerUi.setup(developersApiSpec));
app.use('/api-docs/games', swaggerUi.serve, swaggerUi.setup(gamesApiSpec));

// User routes
app.get('/users', usersController.getAllUsers) 
app.get('/users/:id', usersController.getUserById) 
app.post('/users', usersController.createUser) 
app.put('/users/:id', usersController.updateUser) 
app.delete('/users/:id', usersController.deleteUser) 
app.get('/users/:userId/developers', usersController.getUsersDevelopers)

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
app.get('/developers/:developerId/comments', developersController.getCommentsByDeveloper);

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


app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});