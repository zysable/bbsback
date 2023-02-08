const {getDatabase} = require('../db')
const {ObjectId} = require('mongodb')

exports.getReplies = async (req, res) => {
  const replies = getDatabase().collection('replies')
  const {cp, ps} = req.query
  const pid = new ObjectId(req.query.pid)
  try {
    const total = await replies.countDocuments({pid})
    const cursor = await replies.aggregate([
      {$match: {pid}},
      {$skip: cp * ps - ps},
      {$limit: +ps},
      {$set: {cid: '$_id'}},
      {$project: {_id: 0}},
      {
        $lookup: {
          from: 'users', localField: 'uid',
          foreignField: '_id', pipeline: [
            {$project: {_id: 0, username: 1, avatar: 1}}
          ],
          as: 'user'
        }
      },
      {$replaceRoot: {newRoot: {$mergeObjects: [{$arrayElemAt: ['$user', 0]}, '$$ROOT']}}},
      {$project: {user: 0}}
    ])
    const replyList = await cursor.toArray()
    res.sendJson({replyList, total}, 200, 'ok')
  } catch (e) {
    res.sendJson(null, 503, e.message)
  }

}
exports.createReply = async (req, res) => {
  const posts = getDatabase().collection('posts')
  const replies = getDatabase().collection('replies')
  const {comment, uid, pid} = req.body
  try {
    const {insertedId} = await replies.insertOne({
      comment, uid: new ObjectId(uid),
      pid: new ObjectId(pid),
      createdAt: new Date()
    })
    await posts.updateOne({_id: new ObjectId(pid)}, {
      $set: {last_cid: insertedId},
      $inc: {r_count: 1}
    })
    const result = {}
    res.sendJson(result, 200, 'ok')
  } catch (e) {
    res.sendJson(null, 503, e.message)
  }
}

exports.deleteReply = async (req, res) => {
  const posts = getDatabase().collection('posts')
  const replies = getDatabase().collection('replies')
  const {id} = req.params
  const result = {}
  try {
    const reply = await replies.findOne({_id: new ObjectId(id)})
    await replies.deleteOne({_id: new ObjectId(id)})
    await posts.updateOne({_id: reply.pid}, {$inc: {r_count: -1}})
    const post = await posts.findOne({_id: reply.pid})
    console.log(reply._id.toString())
    console.log(post.last_cid.toString())
    if (reply._id.toString() === post.last_cid.toString()) {
      const repliesCursor = await replies.find({}, {sort: {_id: -1}, limit: 1})
      const [lastReply] = await repliesCursor.toArray()
      if (lastReply) {
        await posts.updateOne({_id: reply.pid}, {$set: {last_cid: lastReply._id}})
        res.sendJson(result, 200, 'Replaced last replay')
      } else {
        await posts.updateOne({_id: reply.pid}, {$set: {last_cid: ''}})
        res.sendJson(result, 200, 'No more reply for current post')
      }
    } else {
      res.sendJson(result, 200, 'ok')
    }
  } catch (e) {
    res.sendJson(null, 503, e.message)
  }
}