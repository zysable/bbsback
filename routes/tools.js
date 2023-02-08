const express = require('express')
const router = express.Router()
const multer = require('multer')
const {convertImage} = require('../controllers/tools-controller')
const auth = require('../middlewares/auth')
const fs = require('node:fs')
const path = require('node:path')

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/input_files')
  }, filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
})
const upload = multer({storage: storage})

router.use(auth)

router.use((req, res, next) => {
  if (!fs.existsSync(path.resolve(process.cwd(), 'public/input_files'))) {
    fs.mkdirSync(path.resolve(process.cwd(), 'public/input_files'), {recursive: true})
  }
  if (!fs.existsSync(path.resolve(process.cwd(), 'public/output_files'))) {
    fs.mkdirSync(path.resolve(process.cwd(), 'public/output_files'), {recursive: true})
  }
  next()
})
router.post('/convert-image', upload.single('file'), convertImage)

module.exports = router