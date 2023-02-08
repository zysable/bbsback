const express = require('express')
const router = express.Router()
const auth = require('../middlewares/auth')
const {getPosts, createPost, editPost, uploadImg, getPost, deletePost} = require('../controllers/post-controller')
const multer = require('multer')
const {nanoid} = require('nanoid/non-secure')
const fs = require('node:fs')
const path = require('node:path')

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/uploads')
  }, filename: function (req, file, cb) {
    cb(null, nanoid())
  }
})
const upload = multer({storage: storage})

router.use(auth)
router.get('/posts', getPosts)
router.post('/create', createPost)
router.patch('/edit/:id', editPost)
router.get('/:id', getPost)
router.delete('/delete/:id', deletePost)

router.use((req, res, next) => {
  if (!fs.existsSync(path.resolve(process.cwd(), 'public/uploads'))) {
    fs.mkdirSync(path.resolve(process.cwd(), 'public/uploads'), {recursive: true})
  }
  next()
})
router.post('/upload', upload.single('image'), uploadImg)

module.exports = router