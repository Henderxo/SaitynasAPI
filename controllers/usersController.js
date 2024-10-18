const Developer = require('../models/Developer')
const User = require('../models/User') 
const bcrypt = require('bcrypt') 
const mongoose = require('mongoose')


const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/ 
  return emailRegex.test(email) 
}

// GET all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
    res.json(users)
  } catch (error) {
    res.status(500).json({ error: 'Error fetching users' })
  }
}

// GET a single user by ID
exports.getUserById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ error: 'User not found' })
    }
    const user = await User.findById(req.params.id)
    
    if (user) {
      res.json(user)
    } else {
      res.status(404).json({ error: 'User not found' })
    }
  } catch (error) {
    res.status(500).json({ error: 'Error getting user' })
  }
} 

exports.getUsersDevelopers = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.userId)) {
      return res.status(404).json({ error: 'User not found' })
    }
    let userQuery = Developer.find({ userId: req.params.userId })

    const user = await userQuery
    if (user) {
      res.json(user)
    } else {
      res.status(404).json({ error: 'User not found' })
    }
  } catch (error) {
    res.status(500).json({ error: 'Error getting user developers' })
  }
} 

// POST a new user
exports.createUser = async (req, res) => {
  try {

    const { username, email, password, type } = req.body 

    const validTypes = ['admin', 'dev', 'guest'] 
    if (!validTypes.includes(type)) {
      return res.status(422).json({ error: 'Invalid user type. Valid types are: admin, dev, guest' }) 
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' }) 
    }

    const newUser = new User({
      username,
      email,
      password, 
      type,
      created_at: new Date()
    }) 

    const savedUser = await newUser.save() 
    res.status(201).json(savedUser) 
  } catch (error) {
    if (error.code === 11000) {
      res.status(422).json({ error: 'Email already exists' }) 
    } else {
      res.status(500).json({ error: 'Error creating user' }) 
    }
  }
} 

// PUT (update) an existing user
exports.updateUser = async (req, res) => {
  try {
    const { username, email, password, type } = req.body 
    if(!username || !email || !password || !type){
      return res.status(400).json({ error: 'Need all fields' }) 
    }
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ error: 'User not found' })
    }
    const validTypes = ['admin', 'dev', 'guest'] 
    if (!validTypes.includes(type)) {
      return res.status(422).json({ error: 'Invalid user type. Valid types are: admin, dev, guest' }) 
    }

    if (email && !isValidEmail(email)) {
      return res.status(422).json({ error: 'Invalid email format' }) 
    }

    let updatedData = { username, email, type } 

    const salt = await bcrypt.genSalt(10) 
    updatedData.password = await bcrypt.hash(password, salt) 
    

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      updatedData,
      { new: true, runValidators: true }
    ) 

    if (updatedUser) {
      res.json(updatedUser) 
    } else {
      res.status(404).json({ error: 'User not found' }) 
    }
  } catch (error) {
    res.status(500).json({ error: 'Error updating user' }) 
  }
} 

// DELETE a user
exports.deleteUser = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ error: 'User not found' })
    }
    const deletedUser = await User.findByIdAndDelete(req.params.id)  
    if (deletedUser) {
      res.json(deletedUser) 
    } else {
      res.status(404).json({ error: 'User not found' }) 
    }
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: 'Error deleting user' }) 
  }
} 
