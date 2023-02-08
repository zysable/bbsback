const express = require('express')
const router = express.Router()
const {getReplies, createReply, deleteReply} = require('../controllers/reply-controller')
const auth = require('../middlewares/auth')

router.use(auth)
router.get('/replies', getReplies)
router.post('/create', createReply)
router.delete('/delete/:id', deleteReply)

module.exports = router

