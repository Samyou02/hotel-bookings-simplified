const { mongoose } = require('../config/db')

const SettingsSchema = new mongoose.Schema({ taxRate: { type: Number, default: 10 }, commissionRate: { type: Number, default: 15 } })

module.exports = mongoose.model('Settings', SettingsSchema)