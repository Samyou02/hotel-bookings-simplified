const { mongoose } = require('../config/db')
const seqSchema = new mongoose.Schema({ name: { type: String, unique: true }, value: { type: Number, default: 0 } })
module.exports = mongoose.model('Sequence', seqSchema)