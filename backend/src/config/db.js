const mongoose = require('mongoose')
mongoose.set('strictQuery', false)

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/hotel_app'

let connected = false
async function connect() {
  if (connected && isConnected()) return
  try {
    const dbName = process.env.MONGODB_DB || 'hotel_app'
    console.log(`[MongoDB] connecting to ${MONGODB_URI} db=${dbName}`)
    await mongoose.connect(MONGODB_URI, { autoIndex: true, serverSelectionTimeoutMS: 8000, dbName })
    connected = true
    console.log('[MongoDB] connected')
  } catch (e) {
    connected = false
    console.error('[MongoDB] connection error', e?.message || e)
    throw e
  }
}

function isConnected() {
  return mongoose.connection && mongoose.connection.readyState === 1
}

mongoose.connection.on('connected', () => {
  connected = true
  console.log('[MongoDB] connection state: connected')
})
mongoose.connection.on('error', (err) => {
  connected = false
  console.error('[MongoDB] connection state: error', err?.message || err)
})
mongoose.connection.on('disconnected', () => {
  connected = false
  console.warn('[MongoDB] connection state: disconnected')
})

module.exports = { connect, isConnected, mongoose }