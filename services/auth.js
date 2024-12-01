const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {

  const token = req.cookies?.accessToken;  // Cookie key should be 'accessToken' (based on your implementation)

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;  
    next(); 
   
  } catch (error) {
    res.status(403).json({ error: 'Invalid or expired token.' });
  }
};

module.exports = auth;