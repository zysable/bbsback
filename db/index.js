const {MongoClient} = require('mongodb')
const client = new MongoClient(process.env.DB_URL)
const dbName = process.env.DB_NAME

let db

async function connectDB() {
  await client.connect()
  db = client.db(dbName)
}

async function closeConnection() {
  await client.close()
}

function getDatabase() {
  return db
}

module.exports = {
  connectDB, closeConnection, getDatabase
}

