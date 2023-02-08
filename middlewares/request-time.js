module.exports = function (req, res, next) {
  req.requestTime = process.hrtime()
  next()
}