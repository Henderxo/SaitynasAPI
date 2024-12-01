const authorize = (roles = []) => {
  if (typeof roles === 'string') {
    roles = [roles]
  }

  return (req, res, next) => {
    const userRole = req.user.type;

    if (!roles.includes(userRole)) {
      return res.status(403).json({ error: 'Access denied. You do not have permission to perform this action.' })
    }

    next()
  }
}

module.exports = authorize;