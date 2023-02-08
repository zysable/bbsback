const fs = require('node:fs')
const {covertImgToWebp} = require('../utils')

exports.convertImage = async (req, res) => {
  try {
    const newImage = await covertImgToWebp(req.file)
    const options = {
      headers: {
        'x-timestamp': Date.now(), 'x-filename': newImage.name
      }
    }
    res.sendFile(newImage.path, options, e => {
      if (e) {
        throw e
      }
      else {
        fs.unlinkSync(newImage.path)
        fs.unlinkSync(newImage.originalPath)
      }
    })
  } catch (e) {
    res.sendJson(null, '503', e.message)
  }

}