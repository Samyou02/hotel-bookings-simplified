const { mongoose } = require('../config/db')

const WishlistSchema = new mongoose.Schema({ userId: Number, hotelId: Number, createdAt: { type: Date, default: Date.now } })

module.exports = mongoose.model('Wishlist', WishlistSchema)