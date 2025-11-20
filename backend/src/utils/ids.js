const Sequence = require('../models/Sequence')

async function nextIdFor(name) {
  const doc = await Sequence.findOneAndUpdate({ name }, { $inc: { value: 1 } }, { new: true, upsert: true })
  return doc.value
}

module.exports = { nextIdFor }