const {getDatabase} = require('../db')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const {ObjectId} = require('mongodb')

exports.userRegister = async (req, res) => {
  const users = getDatabase().collection('users')
  const {username, password} = req.body
  const hashedPass = bcrypt.hashSync(password, 10)
  try {
    const user = await users.findOne({username})
    if (user) throw new Error('User exists!')
    const result = await users.insertOne({
      username, password: hashedPass, avatar: 'avatar0', createdAt: new Date()
    })
    res.sendJson(result, 201, 'User Created!')
  } catch (e) {
    res.sendJson(null, 409, e.message)
  }
}

exports.userLogin = async (req, res) => {
  const users = getDatabase().collection('users')
  const {username, password} = req.body
  try {
    const user = await users.findOne({username})
    if (!user || !bcrypt.compareSync(password, user.password)) throw new Error('Wrong User or Password!')
    const token = jwt.sign({uid: user._id.toString()}, process.env.JWT_KEY, {expiresIn: '7d'})
    res.sendJson({token}, 200, 'Signed in!')
  } catch (e) {
    res.sendJson(null, 401, e.message)
  }
}

exports.retrieveUser = async (req, res) => {
  const users = getDatabase().collection('users')
  try {
    const user = await users.findOne({_id: new ObjectId(req.uid)})
    res.sendJson({
      uid: req.uid,
      username: user.username,
      avatar: user.avatar
    }, 200, 'ok')
  } catch (e) {
    res.sendJson(null, 401, e.message)
  }
}

exports.updateUser = async (req, res) => {
  const users = getDatabase().collection('users')
  const {username, password, avatar} = req.body
  const filter = {_id: new ObjectId(req.uid)}
  const update = {$set: {username, avatar}, $currentDate: {lastModified: true}}
  if (password) {
    const hashedPass = bcrypt.hashSync(password, 10)
    update.$set.password = hashedPass
  }
  try {
    await users.updateOne(filter, update)
    const result = {uid: req.uid, username, avatar}
    res.sendJson(result, 200, 'User Updated!')
  } catch (e) {
    if (e.message.includes('duplicate key error')) e.message = 'Username Exists'
    res.sendJson(null, 503, e.message)
  }
}