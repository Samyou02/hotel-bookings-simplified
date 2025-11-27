const { mongoose } = require('../config/db')

const SettingsSchema = new mongoose.Schema({
  taxRate: { type: Number, default: 10 },
  commissionRate: { type: Number, default: 15 },
  ourStory: { type: String, default: '' },
  ourMission: { type: String, default: '' },
  contactName: { type: String, default: '' },
  contactEmail: { type: String, default: '' },
  contactPhone1: { type: String, default: '' },
  contactPhone2: { type: String, default: '' }
})

module.exports = mongoose.model('Settings', SettingsSchema)
