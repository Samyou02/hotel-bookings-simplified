const { mongoose } = require('../config/db')
const PricingSchema = new mongoose.Schema({ weekendPercent: { type: Number, default: 0 }, seasonal: [{ start: String, end: String, percent: Number }], specials: [{ date: String, price: Number }] }, { _id: false })
module.exports = PricingSchema