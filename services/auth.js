const jwt = require('jsonwebtoken')

const auth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '')

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' })
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    console.log(decoded)
    req.user = decoded
    next()
  } catch (error) {
    res.status(403).json({ error: 'Invalid token.' })
  }
}

module.exports = auth
