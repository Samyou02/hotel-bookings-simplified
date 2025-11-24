const { mongoose } = require('../config/db')

const MessageThreadSchema = new mongoose.Schema({
  id: { type: Number, index: true },
  bookingId: Number,
  hotelId: Number,
  userId: Number,
  ownerId: Number,
  createdAt: { type: Date, default: Date.now }
})

module.exports = mongoose.model('MessageThread', MessageThreadSchema)