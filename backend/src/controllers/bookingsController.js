const { connect } = require('../config/db')
const ensureSeed = require('../seed')
const { nextIdFor } = require('../utils/ids')
const { Booking, Hotel, Room, Settings } = require('../models')

async function create(req, res) {
  await connect(); await ensureSeed();
  const { hotelId, checkIn, checkOut, guests, userId, roomType } = req.body || {}
  if (!hotelId || !checkIn || !checkOut || !guests) return res.status(400).json({ error: 'Missing booking fields' })
  const hotel = await Hotel.findOne({ id: Number(hotelId) })
  if (!hotel) return res.status(404).json({ error: 'Hotel not found' })
  const ci = new Date(checkIn)
  const co = new Date(checkOut)
  if (!(ci instanceof Date) || isNaN(ci.getTime()) || !(co instanceof Date) || isNaN(co.getTime()) || ci >= co) return res.status(400).json({ error: 'Invalid dates' })
  const settings = await Settings.findOne().lean()
  const holdMinutes = Number(settings?.holdMinutes || 15)
  const now = new Date()
  const filter = { hotelId: Number(hotelId), availability: true }
  if (roomType) filter.type = String(roomType)
  const rooms = await Room.find(filter).lean()
  if (!rooms || rooms.length === 0) return res.status(409).json({ error: 'No rooms available' })
  let chosenRoomId = null
  for (const r of rooms) {
    const existing = await Booking.find({ roomId: r.id, status: { $in: ['held','confirmed','checked_in'] } }).lean()
    const overlaps = existing.some(b => {
      const bCi = new Date(b.checkIn)
      const bCo = new Date(b.checkOut)
      const isHeldActive = b.status === 'held' ? (b.holdExpiresAt && new Date(b.holdExpiresAt) > now) : true
      if (!isHeldActive) return false
      return ci < bCo && co > bCi
    })
    if (!overlaps && !r.blocked) { chosenRoomId = r.id; break }
  }
  if (!chosenRoomId) return res.status(409).json({ error: 'No rooms available for selected dates' })
  const chosenRoom = rooms.find(x => x.id === chosenRoomId) || await Room.findOne({ id: Number(chosenRoomId) }).lean()
  const pricePerDay = Number(chosenRoom?.price || 0)
  const diffMs = co.getTime() - ci.getTime()
  const diffHours = Math.ceil(diffMs / (1000 * 60 * 60))
  const stayDays = diffHours > 0 && diffHours <= 24 ? 1 : Math.floor(diffHours / 24)
  const extraHours = diffHours > 24 ? (diffHours - stayDays * 24) : 0
  const baseAmount = stayDays * pricePerDay
  const extraAmount = Math.round((pricePerDay / 24) * extraHours)
  const computedTotal = baseAmount + extraAmount
  const id = await nextIdFor('Booking')
  const holdExpiresAt = new Date(Date.now() + holdMinutes * 60 * 1000)
  await Booking.create({ id, userId: Number(userId) || null, hotelId: Number(hotelId), roomId: Number(chosenRoomId), checkIn, checkOut, guests: Number(guests), total: computedTotal, status: 'held', holdExpiresAt, paid: false })
  const roomDoc = await Room.findOne({ id: Number(chosenRoomId) })
  if (roomDoc) { roomDoc.blocked = true; await roomDoc.save() }
  res.json({ status: 'reserved', id, roomId: chosenRoomId, holdExpiresAt })
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

async function confirm(req, res) {
  await connect(); await ensureSeed();
  const id = Number(req.params.id)
  const b = await Booking.findOne({ id })
  if (!b) return res.status(404).json({ error: 'Booking not found' })
  const now = new Date()
  if (b.status !== 'held') return res.status(409).json({ error: 'Booking not in held state' })
  if (b.holdExpiresAt && new Date(b.holdExpiresAt) <= now) return res.status(409).json({ error: 'Hold expired' })
  b.status = 'confirmed'
  b.paid = true
  await b.save()
  if (b.roomId) {
    const r = await Room.findOne({ id: Number(b.roomId) })
    if (r) { r.blocked = false; await r.save() }
  }
  res.json({ status: 'confirmed' })
}

module.exports = { create, invoice, confirm }