const express = require('express')
const path = require('path')
const morgan = require('morgan')
const helmet = require('helmet')
const cors = require('cors')
const compression = require('compression')
require('dotenv').config()
const requestTime = require('./middlewares/request-time')
const responseFormat = require('./middlewares/response-format')

const userRouter = require('./routes/user')
const postRouter = require('./routes/post')
const replyRouter = require('./routes/reply')
const toolsRouter = require('./routes/tools')

const app = express()
app.disable('x-powered-by')

app.use(helmet())
app.use(cors())
app.use((req,res,next) => {
  res.set('Access-Control-Expose-Headers', 'x-timestamp, x-filename')
  next()
})
app.use(requestTime)
app.use(morgan('short'))
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(express.static(path.join(__dirname, 'public')))

app.use(responseFormat)
app.use(compression())

app.use('/api/user', userRouter)
app.use('/api/post', postRouter)
app.use('/api/reply', replyRouter)
app.use('/api/tools', toolsRouter)

app.use((req, res) => {
  res.send('<h1>403 Forbidden</h1>')
})

module.exports = app
