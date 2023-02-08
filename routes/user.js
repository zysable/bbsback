const express = require('express')
const router = express.Router()
const {userLogin, userRegister, updateUser,retrieveUser} = require('../controllers/user-controller')
const auth = require('../middlewares/auth')

// router.post('/register', userRegister)
router.post('/login', userLogin)

router.use(auth)
router.patch('/update', updateUser)
router.get('/retrieve', retrieveUser)

module.exports = router