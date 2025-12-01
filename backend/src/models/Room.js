const { mongoose } = require('../config/db')

const RoomSchema = new mongoose.Schema({
  id: { type: Number, index: true },
  hotelId: Number,
  type: String,
  roomNumber: { type: String, default: '' },
  price: Number,
  members: { type: Number, default: 1 },
  amenities: [String],
  photos: [String],
  availability: { type: Boolean, default: true },
  blocked: { type: Boolean, default: false }
})

module.exports = mongoose.model('Room', RoomSchema)
