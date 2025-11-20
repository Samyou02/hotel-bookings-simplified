const { connect } = require('../config/db')
const ensureSeed = require('../seed')
const { Hotel, Booking, Review } = require('../models')

async function list(req, res) {
  try {
    await connect(); await ensureSeed();
    const { q, minPrice, maxPrice, minRating } = req.query
    const filter = {}
    if (q && typeof q === 'string') filter.name = { $regex: q, $options: 'i' }
    if (minPrice || maxPrice) filter.price = {}
    if (minPrice) filter.price.$gte = Number(minPrice)
    if (maxPrice) filter.price.$lte = Number(maxPrice)
    if (minRating) filter.rating = { $gte: Number(minRating) }
    const items = await Hotel.find(filter).lean()
    res.json({ hotels: items })
  } catch (e) {
    res.status(503).json({ error: 'Database unavailable' })
  }
}

async function getById(req, res) {
  try {
    await connect(); await ensureSeed();
    const id = Number(req.params.id)
    const hotel = await Hotel.findOne({ id }).lean()
    if (!hotel) return res.status(404).json({ error: 'Not found' })
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

async function featured(req, res) {
  try {
    await connect(); await ensureSeed();
    const items = await Hotel.find().limit(4).lean()
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

module.exports = { list, getById, getReviews, featured, about }