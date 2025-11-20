const { connect } = require('../config/db')
const ensureSeed = require('../seed')
const { Hotel, Booking, Review, Room } = require('../models')

async function list(req, res) {
  try {
    await connect(); await ensureSeed();
    const { q, minPrice, maxPrice, minRating } = req.query
    const filter = { ownerId: { $ne: null }, status: 'approved' }
    if (q && typeof q === 'string') filter.name = { $regex: q, $options: 'i' }
    if (minPrice || maxPrice) filter.price = {}
    if (minPrice) filter.price.$gte = Number(minPrice)
    if (maxPrice) filter.price.$lte = Number(maxPrice)
    if (minRating) filter.rating = { $gte: Number(minRating) }
    const items = await Hotel.find(filter).lean()
    const hotels = items.map(h => ({
      ...h,
      image: h.image || (Array.isArray(h.images) && h.images.length > 0 ? h.images[0] : '/src/assets/hotel-1.jpg')
    }))
    res.json({ hotels })
  } catch (e) {
    res.status(503).json({ error: 'Database unavailable' })
  }
}

async function getById(req, res) {
  try {
    await connect(); await ensureSeed();
    const id = Number(req.params.id)
    const hotelRaw = await Hotel.findOne({ id }).lean()
    if (!hotelRaw) return res.status(404).json({ error: 'Not found' })
    const hotel = { ...hotelRaw, image: hotelRaw.image || (Array.isArray(hotelRaw.images) && hotelRaw.images.length > 0 ? hotelRaw.images[0] : '/src/assets/hotel-1.jpg') }
    res.json({ hotel })
  } catch (e) {
    res.status(503).json({ error: 'Database unavailable' })
  }
}

async function getReviews(req, res) {
  await connect(); await ensureSeed();
  const id = Number(req.params.id)
  const items = await Review.find({ hotelId: id }).lean()
  res.json({ reviews: items })
}

async function getRooms(req, res) {
  await connect(); await ensureSeed();
  const id = Number(req.params.id)
  const items = await Room.find({ hotelId: id }).lean()
  res.json({ rooms: items })
}

async function featured(req, res) {
  try {
    await connect(); await ensureSeed();
    const items = await Hotel.find({ ownerId: { $ne: null }, status: 'approved' }).limit(4).lean()
    res.json({ hotels: items })
  } catch (e) {
    res.status(503).json({ error: 'Database unavailable' })
  }
}

async function about(req, res) {
  await connect(); await ensureSeed();
  const totalHotels = await Hotel.countDocuments()
  const totalBookings = await Booking.countDocuments()
  const stats = [
    { label: 'Hotels', value: String(totalHotels) },
    { label: 'Happy Customers', value: String(totalBookings) },
    { label: 'Awards Won', value: '25+' },
    { label: 'Countries', value: '180+' }
  ]
  res.json({ stats })
}

module.exports = { list, getById, getReviews, featured, about, getRooms }