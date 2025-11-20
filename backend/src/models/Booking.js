const { mongoose } = require('../config/db')

const BookingSchema = new mongoose.Schema({
  id: { type: Number, index: true },
  userId: Number,
  hotelId: Number,
  checkIn: String,
  checkOut: String,
  guests: Number,
  total: Number,
  status: { type: String, default: 'pending' },
  refundIssued: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
})

module.exports = mongoose.model('Booking', BookingSchema)