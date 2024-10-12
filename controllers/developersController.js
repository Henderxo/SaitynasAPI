const { rawListeners } = require('../models/Comment')
const Developer = require('../models/Developer') 
const User = require('../models/User')

// GET all developers
exports.getAllDevelopers = async (req, res) => {
  try {
    const { expand } = req.query 
    let developersQuery = Developer.find()

    if(expand && expand.includes('userId')){
      developersQuery - developersQuery.populate('userId')
    }

    const developers = await developersQuery
    res.json(developers) 
  } catch (error) {
    res.status(500).json({ error: 'Server error' }) 
  }
} 

// GET a single developer by ID
exports.getDeveloperById = async (req, res) => {
  try {
    const { expand } = req.query
    let developersQuery = Developer.findById(req.params.id)

    if(expand && expand.includes('userId')){
      developersQuery - developersQuery.populate('userId')
    }

    const developer = await developersQuery 
    if (developer) {
      res.json(developer) 
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
    const { name, founder, founded, headquarters, userId } = req.body 

    const user = await User.findById(userId) 
    if (!user) {
      return res.status(404).json({ error: 'User not found' }) 
    }

    const newDeveloper = new Developer({
      name,
      founder,
      founded,
      headquarters,
      userId
    }) 

    await newDeveloper.save()  
    res.status(201).json(newDeveloper) 
  } catch (error) {
    res.status(400).json({ error: 'Bad request' }) 
  }
} 

// PUT (update) an existing developer
exports.updateDeveloper = async (req, res) => {
  try {

    const developer = await Developer.findById(req.params.id) 

    if (!developer) {
      return res.status(404).json({ error: 'Developer not found' }) 
    }
    if(req.body.userId){
      const user = await User.findById(req.body.userId) 
      if (!user) {
        return res.status(404).json({ error: 'User not found' }) 
      }
    }

    const updatedDeveloper = await Developer.findByIdAndUpdate(req.params.id, req.body, { new: true }) 
    
    if (updatedDeveloper) {
      res.json(updatedDeveloper) 
    } else {
      res.status(404).json({ error: 'Developer not found' }) 
    }
  } catch (error) {

    res.status(400).json({ error: 'Bad request' }) 
  }
} 

// DELETE a developer
exports.deleteDeveloper = async (req, res) => {
  try {
 
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
