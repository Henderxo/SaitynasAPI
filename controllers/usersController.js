const Developer = require('../models/Developer')
const User = require('../models/User') 
const bcrypt = require('bcrypt') 
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')


const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/ 
  return emailRegex.test(email) 
}

// GET all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password'); 
    if(users){
      const usersWithPhotos = users.map(user => {
        const photoBase64 = user.photo ? user.photo.toString('base64') : null;
        return {
          ...user.toObject(),
          photo: photoBase64, // Only Base64 string, no MIME type
        };
      });
      res.json(usersWithPhotos)
    }
  } catch (error) {
    res.status(500).json({ error: 'Error fetching users' })
  }
}



exports.refreshToken = async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;  

  if (!refreshToken) {
    return res.status(403).json({ error: 'Refresh token is required' });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET); 
    
    const newAccessToken = jwt.sign(
      { id: decoded.id, type: decoded.type },
      process.env.JWT_SECRET,
      { expiresIn: '1h' } 
    );


    res.cookie('accessToken', newAccessToken, {
      httpOnly: true,  
      secure: process.env.NODE_ENV === 'production',  
      maxAge: 1 * 60 * 60 * 1000,  
    });

    res.json({token: newAccessToken});

  } catch (error) {
    res.status(403).json({ error: 'Invalid or expired refresh token' });
  }
};

exports.logoutUser = async (req, res) => {
  const { refreshToken } = req.body; 

  if (!refreshToken) {
    return res.sendStatus(204);
  }

  const user = await User.findOne({ refreshToken });

  if (user) {
    user.refreshToken = null;
    await user.save();
  }

  res.sendStatus(204);
};

const generateTokens = (user) => {
  const accessToken = jwt.sign({ id: user._id, type: user.type }, process.env.JWT_SECRET, { expiresIn: '10m' });
  const refreshToken = jwt.sign({ id: user._id, type: user.type }, process.env.JWT_SECRET, { expiresIn: '7d' });

  return { accessToken, refreshToken };
};


exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    const { accessToken, refreshToken } = generateTokens(user);

    const photoBase64 = user.photo ? user.photo.toString('base64') : null;

    res
      .cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 1 * 60 * 60 * 1000, 
      })
      .cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, 
      })
      .json({
        token: accessToken,
        user: {
          
          _id: user._id,
          username: user.username,
          email: user.email,
          type: user.type,
          photo: photoBase64,
        },
      });
  } catch (error) {
    res.status(500).json({ error: 'Error logging in.' });
  }
};

// GET a single user by ID
exports.getUserById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ error: 'User not found' })
    }
    const user = await User.findById(req.params.id).select('-password'); 
    
    if (user) {
      const photoBase64 = user.photo ? user.photo.toString('base64') : null;

    res.json({
      ...user.toObject(),
      photo: photoBase64, // Only Base64 string, no MIME type
    });
    } else {
      res.status(404).json({ error: 'User not found' })
    }
  } catch (error) {
    res.status(500).json({ error: 'Error getting user' })
  }
} 

exports.getUsersDevelopers = async (req, res) => {
  try {
    // Check if the userId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.userId)) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Query developers by userId
    let developersQuery = Developer.find({ userId: req.params.userId });

    // Retrieve developers
    const developers = await developersQuery;

    if (developers) {
      // Process the developers to include the photo as a Base64 string
      const developersWithPhotos = developers.map(developer => {
        const photoBase64 = developer.photo ? developer.photo.toString('base64') : null;

        return {
          ...developer.toObject(),
          photo: photoBase64, // Add photo as Base64 string
        };
      });

      res.json(developersWithPhotos); // Return the developers with photos
    } else {
      res.status(404).json({ error: 'Developer(s) not found for this user' });
    }
  } catch (error) {

    res.status(500).json({ error: 'Error getting user developers' });
  }
};

// POST a new user
exports.createUser = async (req, res) => {
  try {

    const { username, email, password, type } = req.body 
    const validTypes = ['admin', 'dev', 'guest'] 
    if (!validTypes.includes(type)) {
      return res.status(422).json({ error: 'Invalid user type. Valid types are: admin, dev, guest' }) 
    }
    if(!req.file){
      return res.status(404).json({ error: 'Photo field is required' })
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' }) 
    }

    const newUser = new User({
      username,
      email,
      password, 
      type,
      created_at: new Date(),
      photo: req.file?.buffer
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

    const { username, email, type, password, photo } = req.body 
    if(!username || !email || !type || !(req.file||photo)){
      return res.status(400).json({ error: 'Need all fields' }) 
    }
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ error: 'User not found' })
    }

    if (req.user.id !== req.params.id && req.user.type !== 'admin') {
      return res.status(403).json({ error: 'You do not have permission to update this user' });
    }

    const validTypes = ['admin', 'dev', 'guest'] 
    if (!validTypes.includes(type)) {
      return res.status(422).json({ error: 'Invalid user type. Valid types are: admin, dev, guest' }) 
    }

    const existingUser = await User.findById(req.params.id);
    if (!existingUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (type && type !== existingUser.type) {
      if (req.user.type !== 'admin') {
        return res.status(403).json({ error: 'You do not have permission to change the user type' });
      }

      const validTypes = ['admin', 'dev', 'guest'];
      if (!validTypes.includes(type)) {
        return res.status(422).json({ error: 'Invalid user type. Valid types are: admin, dev, guest' });
      }
    }


    if (email && !isValidEmail(email)) {
      return res.status(422).json({ error: 'Invalid email format' }) 
    }

    let updatedData = { username, email, type } 
    const salt = await bcrypt.genSalt(10) 
    updatedData.password = password?await bcrypt.hash(password, salt):existingUser.password 
    updatedData.photo = req.file?req.file.buffer:Buffer.from(photo, 'base64');

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
    const userId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ error: 'User not found' })
    }
    if (req.user.id !== userId && req.user.type !== 'admin') {
      return res.status(403).json({ error: 'You do not have permission to delete this user' });
    }
    const deletedUser = await User.findByIdAndDelete(req.params.id)  
    if (deletedUser) {
      res.json(deletedUser) 
    } else {
      res.status(404).json({ error: 'User not found' }) 
    }
  } catch (error) {
    res.status(500).json({ error: 'Error deleting user' }) 
  }
} 
