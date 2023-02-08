const jwt = require('jsonwebtoken')

module.exports = (req, res, next) => {
  try {
    let token = req.get('Authorization')
    if (!token) throw new Error('Unauthorized')
    token = token.split(' ')[1]
    jwt.verify(token, process.env.JWT_KEY, (err, decoded) => {
      if (err) throw new Error('Forbidden')
      req.uid = decoded.uid
      next()
    })
  } catch (e) {
    res.sendJson(null, 401, e.message)
  }
}