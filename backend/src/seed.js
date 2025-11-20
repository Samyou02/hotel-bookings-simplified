const { connect } = require('./config/db')
const { nextIdFor } = require('./utils/ids')
const { Hotel, Settings } = require('./models')

async function ensureSeed() {
  try {
    await connect()
  } catch (e) {
    console.error('[Seed] database connect failed, skip seed')
    return
  }
  let count = 0
  try {
    count = await Hotel.countDocuments()
  } catch (e) {
    console.error('[Seed] count failed, skip seed')
    return
  }
  if (count === 0) {
    console.log('[Seed] seeding base hotels and settings')
    const base = [
      { name: 'Grand Luxury Hotel', location: 'New York, USA', rating: 4.8, reviews: 328, price: 299, image: '/src/assets/hotel-1.jpg', amenities: ['WiFi','Breakfast','Parking'], description: 'Experience luxury and comfort at our Grand Luxury Hotel.' },
      { name: 'Tropical Paradise Resort', location: 'Bali, Indonesia', rating: 4.9, reviews: 512, price: 189, image: '/src/assets/hotel-2.jpg', amenities: ['WiFi','Breakfast','Parking'], description: 'Relax at our tropical paradise resort.' },
      { name: 'Mediterranean Villa', location: 'Santorini, Greece', rating: 4.7, reviews: 256, price: 349, image: '/src/assets/hotel-3.jpg', amenities: ['WiFi','Breakfast'], description: 'Enjoy views at our Mediterranean villa.' },
      { name: 'Alpine Mountain Lodge', location: 'Swiss Alps, Switzerland', rating: 4.9, reviews: 425, price: 279, image: '/src/assets/hotel-4.jpg', amenities: ['WiFi','Parking'], description: 'Stay at our alpine mountain lodge.' }
    ]
    for (const h of base) {
      const id = await nextIdFor('Hotel')
      await Hotel.create({ id, ownerId: null, status: 'approved', featured: false, images: [], docs: [], pricing: {}, ...h })
    }
    let exists = 0
    try {
      exists = await Settings.countDocuments()
    } catch (e) {
      exists = 0
    }
    if (exists === 0) await Settings.create({ taxRate: 10, commissionRate: 15 })
    console.log('[Seed] completed')
  }
}

module.exports = ensureSeed