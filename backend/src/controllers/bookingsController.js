const { connect } = require('../config/db')
const ensureSeed = require('../seed')
const { nextIdFor } = require('../utils/ids')
const { Booking, Hotel, Settings } = require('../models')

async function create(req, res) {
  await connect(); await ensureSeed();
  const { hotelId, checkIn, checkOut, guests, total, userId } = req.body || {}
  if (!hotelId || !checkIn || !checkOut || !guests) return res.status(400).json({ error: 'Missing booking fields' })
  const hotel = await Hotel.findOne({ id: Number(hotelId) })
  if (!hotel) return res.status(404).json({ error: 'Hotel not found' })
  const id = await nextIdFor('Booking')
  await Booking.create({ id, userId: Number(userId) || null, hotelId: Number(hotelId), checkIn, checkOut, guests: Number(guests), total: Number(total) || 0, status: 'pending' })
  res.json({ status: 'reserved', id })
}

async function invoice(req, res) {
  await connect(); await ensureSeed();
  const id = Number(req.params.id)
  const b = await Booking.findOne({ id }).lean()
  if (!b) return res.status(404).json({ error: 'Booking not found' })
  const h = await Hotel.findOne({ id: b.hotelId }).lean()
  const s = await Settings.findOne().lean()
  const taxRate = Number(s?.taxRate || 0)
  const subtotal = Number(b.total || 0)
  const tax = Math.round(subtotal * taxRate) / 100
  const total = subtotal + tax
  res.json({ invoice: { id, userId: b.userId, hotel: { id: h?.id, name: h?.name }, subtotal, taxRate, tax, total, createdAt: b.createdAt } })
}

module.exports = { create, invoice }