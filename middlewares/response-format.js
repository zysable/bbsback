module.exports = function (req, res, next) {
  const elapsedTime = process.hrtime(req.requestTime)
  const ms = elapsedTime[0] * 1e3 + elapsedTime[1] * 1e-6
  res.sendJson = function (data, code, msg) {
    res.json({data, code, msg, responseTime: `${ms.toFixed(3)}ms`})
  }
  next()
}