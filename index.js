require('dotenv').config();
const express = require('express') 
const mongoose = require('mongoose')
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path'); 
const cors = require('cors');

const multer = require('multer');
const cookieParser = require('cookie-parser');



const storage = multer.memoryStorage(); 
const upload = multer({
  storage: storage,
  limits: {
    fieldSize: 10 * 1024 * 1024, // Set field size limit to 10 MB
    fileSize: 10 * 1024 * 1024, // Set file size limit to 10 MB
  },
});
const usersController = require('./controllers/usersController') 
const gamesController = require('./controllers/gamesController') 
const developersController = require('./controllers/developersController') 
const commentsController = require('./controllers/commentsController') 
const auth = require('./services/auth');
const authorize = require('./services/authorize');
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

const allowedOrigins = [
  'http://game-forum-gamma.vercel.app',   
  'https://game-forum-gamma.vercel.app',
  'https://game-forum-n9xg5enz7-henderxos-projects.vercel.app'
];

app.use(cors({
  origin: allowedOrigins, 
  credentials: true, 
}));

app.use(cookieParser());

//Swagger
app.use('/api-docs/users', swaggerUi.serveFiles(usersApiSpec), swaggerUi.setup(usersApiSpec));
app.use('/api-docs/comments', swaggerUi.serveFiles(commentsApiSpec), swaggerUi.setup(commentsApiSpec));
app.use('/api-docs/developers', swaggerUi.serveFiles(developersApiSpec), swaggerUi.setup(developersApiSpec));
app.use('/api-docs/games', swaggerUi.serveFiles(gamesApiSpec), swaggerUi.setup(gamesApiSpec));

//Authorization routes
app.post('/login', usersController.loginUser)
app.post('/refresh', usersController.refreshToken)

// User routes
app.get('/users', usersController.getAllUsers) 
app.get('/users/:id', usersController.getUserById) 
app.post('/users', upload.single('photo'), usersController.createUser) 
app.put('/users/:id', auth,  authorize(['admin', 'dev', 'guest']), upload.single('photo'), usersController.updateUser) 
app.delete('/users/:id', auth,  authorize(['admin', 'dev', 'guest']),  usersController.deleteUser) 

// Game routes
app.get('/games', gamesController.getAllGames) 
app.get('/games/:id', gamesController.getGameById) 
app.post('/games',  auth, authorize(['admin', 'dev']),upload.single('photo') , gamesController.createGame) 
app.put('/games/:id', auth, authorize(['admin', 'dev']),upload.single('photo'), gamesController.updateGame) 
app.delete('/games/:id', auth, authorize(['admin', 'dev']), gamesController.deleteGame) 

// Developer routes
app.get('/developers', developersController.getAllDevelopers) 
app.get('/developers/:id', developersController.getDeveloperById) 
app.post('/developers', auth, authorize(['admin']), upload.single('photo'), developersController.createDeveloper) 
app.put('/developers/:id', auth, authorize(['admin', 'dev']), upload.single('photo'), developersController.updateDeveloper) 
app.delete('/developers/:id', auth, authorize(['admin', 'dev']), developersController.deleteDeveloper) 

// Comment routes
app.get('/comments', commentsController.getAllComments)
app.get('/comments/:id', commentsController.getCommentById) 
app.post('/comments', auth, authorize(['admin', 'dev', 'guest']), upload.single('photo'), commentsController.createComment) 
app.put('/comments/:id', auth, authorize(['admin', 'dev', 'guest']), upload.single('photo'),  commentsController.updateComment) 
app.delete('/comments/:id', auth, authorize(['admin', 'dev', 'guest']), commentsController.deleteComment) 


// More routes
app.get('/users/:userId/developers', usersController.getUsersDevelopers)
app.get('/developers/:developerId/comments', developersController.getCommentsByDeveloper);
app.get('/developers/:developerId/games', gamesController.getGamesByDeveloper)
app.get('/games/:gameId/comments', commentsController.getCommentsByGame) 
app.get('/developers/:developerId/games/:gameId/comments/:commentId', commentsController.getSpecificComment)

app.all('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
}) 



app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});