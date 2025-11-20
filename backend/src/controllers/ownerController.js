const { connect } = require('../config/db')
const ensureSeed = require('../seed')
const { nextIdFor } = require('../utils/ids')
const { Hotel, Booking, Room, Review } = require('../models')

async function stats(req, res) {
  await connect(); await ensureSeed();
  const ownerId = Number(req.query.ownerId)
  const hotels = await Hotel.find({ ownerId }).lean()
  const hotelIds = hotels.map(h => h.id)
  const ownerBookings = await Booking.find({ hotelId: { $in: hotelIds } }).lean()
  const totalBookings = ownerBookings.length
  const totalRevenue = ownerBookings.reduce((s,b)=>s+(Number(b.total)||0),0)
  const today = new Date().toISOString().slice(0,10)
  const dailyStats = ownerBookings.filter(b => (b.createdAt||new Date()).toISOString().slice(0,10)===today).length
  const rooms = await Room.find({ hotelId: { $in: hotelIds } }).lean()
  const totalRooms = rooms.length || 1
  const occupied = ownerBookings.filter(b => b.status==='checked_in').length
  const roomOccupancy = Math.round((occupied/totalRooms)*100)
  const upcomingArrivals = ownerBookings.filter(b => new Date(b.checkIn) >= new Date() && b.status==='confirmed').slice(0,10)
  res.json({ totalBookings, totalRevenue, dailyStats, roomOccupancy, upcomingArrivals })
}

async function hotels(req, res) {
  await connect(); await ensureSeed();
  const ownerId = Number(req.query.ownerId)
  const hotels = await Hotel.find({ ownerId }).lean()
  res.json({ hotels })
}

async function submitHotel(req, res) {
  await connect(); await ensureSeed();
  const { ownerId, name, location, price, amenities } = req.body || {}
  if (!ownerId || !name || !location) return res.status(400).json({ error: 'Missing fields' })
  const id = await nextIdFor('Hotel')
  await Hotel.create({ id, ownerId: Number(ownerId), name, location, price: Number(price)||0, image: '', amenities: Array.isArray(amenities)?amenities:[], description: '', status: 'pending', featured: false, images: [], docs: [], pricing: { weekendPercent: 0, seasonal: [], specials: [] } })
  res.json({ status: 'submitted', id })
}

async function updateAmenities(req, res) {
  await connect(); await ensureSeed();
  const id = Number(req.params.id)
  const { amenities } = req.body || {}
  const h = await Hotel.findOne({ id })
  if (!h) return res.status(404).json({ error: 'Hotel not found' })
  h.amenities = Array.isArray(amenities)?amenities:[]
  await h.save()
  res.json({ status: 'updated' })
}

async function updateImages(req, res) {
  await connect(); await ensureSeed();
  const id = Number(req.params.id)
  const { images } = req.body || {}
  const h = await Hotel.findOne({ id })
  if (!h) return res.status(404).json({ error: 'Hotel not found' })
  h.images = Array.isArray(images)?images:[]
  await h.save()
  res.json({ status: 'updated' })
}

async function updateDocs(req, res) {
  await connect(); await ensureSeed();
  const id = Number(req.params.id)
  const { docs } = req.body || {}
  const h = await Hotel.findOne({ id })
  if (!h) return res.status(404).json({ error: 'Hotel not found' })
  h.docs = Array.isArray(docs)?docs:[]
  await h.save()
  res.json({ status: 'updated' })
}

async function rooms(req, res) {
  await connect(); await ensureSeed();
  const ownerId = Number(req.query.ownerId)
  const hotelIds = (await Hotel.find({ ownerId }).lean()).map(h=>h.id)
  const rooms = await Room.find({ hotelId: { $in: hotelIds } }).lean()
  res.json({ rooms })
}

async function createRoom(req, res) {
  await connect(); await ensureSeed();
  const { ownerId, hotelId, type, price, amenities, photos, availability } = req.body || {}
  const h = await Hotel.findOne({ id: Number(hotelId), ownerId: Number(ownerId) })
  if (!h) return res.status(404).json({ error: 'Hotel not found' })
  const id = await nextIdFor('Room')
  await Room.create({ id, hotelId: Number(hotelId), type: String(type||'Standard'), price: Number(price)||0, amenities: Array.isArray(amenities)?amenities:[], photos: Array.isArray(photos)?photos:[], availability: availability!==false, blocked:false })
  res.json({ status: 'created', id })
}

async function updateRoom(req, res) {
  await connect(); await ensureSeed();
  const id = Number(req.params.id)
  const { price, availability, amenities, photos } = req.body || {}
  const r = await Room.findOne({ id })
  if (!r) return res.status(404).json({ error: 'Room not found' })
  if (price!==undefined) r.price = Number(price)
  if (availability!==undefined) r.availability = !!availability
  if (Array.isArray(amenities)) r.amenities = amenities
  if (Array.isArray(photos)) r.photos = photos
  await r.save()
  res.json({ status: 'updated' })
}

async function blockRoom(req, res) {
  await connect(); await ensureSeed();
  const id = Number(req.params.id)
  const { blocked } = req.body || {}
  const r = await Room.findOne({ id })
  if (!r) return res.status(404).json({ error: 'Room not found' })
  r.blocked = !!blocked
  await r.save()
  res.json({ status: 'updated' })
}

async function ownerBookings(req, res) {
  await connect(); await ensureSeed();
  const ownerId = Number(req.query.ownerId)
  const hotelIds = (await Hotel.find({ ownerId }).lean()).map(h=>h.id)
  const bookings = await Booking.find({ hotelId: { $in: hotelIds } }).lean()
  res.json({ bookings })
}

async function approveBooking(req, res) {
  await connect(); await ensureSeed();
  const id = Number(req.params.id)
  const b = await Booking.findOne({ id })
  if (!b) return res.status(404).json({ error: 'Booking not found' })
  b.status = 'confirmed'
  await b.save()
  res.json({ status: 'updated' })
}

async function checkinBooking(req, res) {
  await connect(); await ensureSeed();
  const id = Number(req.params.id)
  const b = await Booking.findOne({ id })
  if (!b) return res.status(404).json({ error: 'Booking not found' })
  b.status = 'checked_in'
  await b.save()
  res.json({ status: 'updated' })
}

async function checkoutBooking(req, res) {
  await connect(); await ensureSeed();
  const id = Number(req.params.id)
  const b = await Booking.findOne({ id })
  if (!b) return res.status(404).json({ error: 'Booking not found' })
  b.status = 'checked_out'
  await b.save()
  res.json({ status: 'updated' })
}

async function cancelBooking(req, res) {
  await connect(); await ensureSeed();
  const id = Number(req.params.id)
  const b = await Booking.findOne({ id })
  if (!b) return res.status(404).json({ error: 'Booking not found' })
  b.status = 'cancelled'
  await b.save()
  res.json({ status: 'updated' })
}

async function pricing(req, res) {
  await connect(); await ensureSeed();
  const hotelId = Number(req.params.hotelId)
  const { weekendPercent, seasonal, specials } = req.body || {}
  const h = await Hotel.findOne({ id: hotelId })
  if (!h) return res.status(404).json({ error: 'Hotel not found' })
  if (!h.pricing) h.pricing = { weekendPercent: 0, seasonal: [], specials: [] }
  if (weekendPercent!==undefined) h.pricing.weekendPercent = Number(weekendPercent)
  if (Array.isArray(seasonal)) h.pricing.seasonal = seasonal
  if (Array.isArray(specials)) h.pricing.specials = specials
  await h.save()
  res.json({ status: 'updated' })
}

async function ownerReviews(req, res) {
  await connect(); await ensureSeed();
  const ownerId = Number(req.query.ownerId)
  const hotelIds = (await Hotel.find({ ownerId }).lean()).map(h=>h.id)
  const items = await Review.find({ hotelId: { $in: hotelIds } }).lean()
  res.json({ reviews: items })
}

async function respondReview(req, res) {
  await connect(); await ensureSeed();
  const id = Number(req.params.id)
  const { response } = req.body || {}
  const r = await Review.findOne({ id })
  if (!r) return res.status(404).json({ error: 'Review not found' })
  r.response = String(response||'')
  await r.save()
  res.json({ status: 'updated' })
}

module.exports = {
  stats,
  hotels,
  submitHotel,
  updateAmenities,
  updateImages,
  updateDocs,
  rooms,
  createRoom,
  updateRoom,
  blockRoom,
  ownerBookings,
  approveBooking,
  checkinBooking,
  checkoutBooking,
  cancelBooking,
  pricing,
  ownerReviews,
  respondReview
}