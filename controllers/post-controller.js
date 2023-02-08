const {getDatabase} = require('../db')
const {ObjectId} = require('mongodb')
const {uploadFile} = require('../services/aws_s3')
const fs = require('node:fs')

exports.getPosts = async (req, res) => {
  const posts = getDatabase().collection('posts')
  const {cp, ps, q} = req.query
  const matchQuery = {}
  if (q) matchQuery.title = {$regex: q, $options: 'i'}
  try {
    const total = await posts.estimatedDocumentCount()
    const cursor = posts.aggregate([
      {$match: matchQuery},
      {$sort: {_id: -1}},
      {$skip: cp * ps - ps},
      {$limit: +ps},
      {$set: {pid: '$_id'}},
      {
        $lookup: {
          from: 'users',
          localField: 'uid',
          foreignField: '_id',
          pipeline: [
            {$set: {user_avatar: '$avatar'}},
            {$project: {_id: 0, username: 1, user_avatar: 1}}
          ],
          as: 'user'
        }
      },
      {$replaceRoot: {newRoot: {$mergeObjects: [{$arrayElemAt: ['$user', 0]}, '$$ROOT']}}},
      {$project: {user: 0, _id: 0}},
      {
        $lookup: {
          from: 'replies',
          localField: 'last_cid',
          foreignField: '_id',
          pipeline: [
            {$set: {last_reply_time: '$createdAt', last_reply_userId: '$uid'}},
            {$project: {_id: 0, last_reply_time: 1, last_reply_userId: 1}}
          ],
          as: 'reply'
        }
      },
      {$replaceRoot: {newRoot: {$mergeObjects: [{$arrayElemAt: ['$reply', 0]}, '$$ROOT']}}},
      {$project: {reply: 0}},
      {
        $lookup: {
          from: 'users',
          localField: 'last_reply_userId',
          foreignField: '_id',
          pipeline: [
            {$set: {last_reply_user: '$username'}},
            {$project: {_id: 0, last_reply_user: 1}}
          ],
          as: 'user'
        }
      },
      {$replaceRoot: {newRoot: {$mergeObjects: [{$arrayElemAt: ['$user', 0]}, '$$ROOT']}}},
      {$project: {user: 0, last_reply_userId: 0}}
    ])
    const postList = await cursor.toArray()
    res.sendJson({
      total, postList
    }, 200, 'ok')
  } catch (e) {
    res.sendJson(null, 503, e.message)
  }
}

exports.createPost = async (req, res) => {
  const posts = getDatabase().collection('posts')
  const {title, desc, content, v_count, r_count, last_cid} = req.body
  try {
    const doc = {
      title, desc, content, createdAt: new Date(), v_count, r_count, last_cid,
      uid: new ObjectId(req.uid)
    }
    await posts.insertOne(doc)
    const result = {}
    res.sendJson(result, 200, 'ok')
  } catch (e) {
    res.sendJson(null, 503, e.message)
  }
}

exports.editPost = async (req, res) => {
  const posts = getDatabase().collection('posts')
  const {title, desc, content} = req.body
  const id = new ObjectId(req.params.id)
  try {
    await posts.updateOne({_id: id}, {$set: {title, desc, content}, $currentDate: {lastModified: true}})
    res.sendJson({}, 200, 'Updated!')
  } catch (e) {
    res.sendJson(null, 503, e.message)
  }
}

exports.uploadImg = async (req, res) => {
  const {filename, path} = req.file
  try {
    const data = await uploadFile(filename, process.env.PATH)
    if (data.key) await fs.promises.unlink(path)
    const result = {
      filename,
      url: process.env.CDN_URL + data.key
    }
    res.sendJson(result, 200, 'ok')
  } catch (e) {
    res.sendJson(null, 503, e.message)
  }
}

exports.getPost = async (req, res) => {
  const posts = getDatabase().collection('posts')
  const usrpost = getDatabase().collection('usrpost')
  const {id} = req.params
  try {
    const postCursor = await posts.aggregate([
      {$match: {_id: new ObjectId(id)}},
      {
        $lookup: {
          from: 'users',
          localField: 'uid',
          foreignField: '_id',
          pipeline: [
            {$set: {user_avatar: '$avatar'}},
            {$project: {_id: 0, username: 1, user_avatar: 1}}
          ],
          as: 'user'
        }
      },
      {$replaceRoot: {newRoot: {$mergeObjects: [{$arrayElemAt: ['$user', 0]}, '$$ROOT']}}},
      {$project: {user: 0, _id: 0}}
    ])
    const [post] = await postCursor.toArray()
    const rel = await usrpost.findOne({uid: new ObjectId(req.uid), pid: new ObjectId(id)})
    if (!rel) {
      post.v_count = post.v_count + 1
      await usrpost.insertOne({uid: new ObjectId(req.uid), pid: new ObjectId(id), createdAt: new Date()})
      await posts.updateOne({_id: new ObjectId(id)}, {$inc: {v_count: 1}})
      res.sendJson(post, 200, 'ok')
    } else res.sendJson(post, 200, 'ok')
  } catch (e) {
    res.sendJson(null, 503, e.message)
  }
}

exports.deletePost = async (req, res) => {
  const posts = getDatabase().collection('posts')
  const usrpost = getDatabase().collection('usrpost')
  const replies = getDatabase().collection('replies')
  const id = new ObjectId(req.params.id)
  try {
    await posts.deleteOne({_id: id})
    await usrpost.deleteMany({pid: id})
    await replies.deleteMany({pid: id})
    res.sendJson({}, 200, 'Deleted!')
  } catch (e) {
    res.sendJson(null, 503, e.message)
  }
}