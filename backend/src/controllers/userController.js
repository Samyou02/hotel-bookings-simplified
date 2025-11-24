const { connect } = require('../config/db')
const ensureSeed = require('../seed')
const { nextIdFor } = require('../utils/ids')
const { Booking, Review, Wishlist, MessageThread, Message, Hotel } = require('../models')

async function bookings(req, res) {
  await connect(); await ensureSeed();
  const userId = Number(req.query.userId)
  const items = await Booking.find({ userId }).lean()
  res.json({ bookings: items })
}

async function cancelBooking(req, res) {
  await connect(); await ensureSeed();
  const id = Number(req.params.id)
  const b = await Booking.findOne({ id })
  if (!b) return res.status(404).json({ error: 'Booking not found' })
  b.status = 'cancelled'
  await b.save()
  let thread = await MessageThread.findOne({ bookingId: id })
  if (!thread) {
    const tid = await nextIdFor('MessageThread')
    const h = await Hotel.findOne({ id: Number(b.hotelId) })
    await MessageThread.create({ id: tid, bookingId: id, hotelId: Number(b.hotelId), userId: Number(b.userId)||null, ownerId: Number(h?.ownerId)||null })
    thread = await MessageThread.findOne({ id: tid }).lean()
  }
  const mid = await nextIdFor('Message')
  await Message.create({ id: mid, threadId: Number(thread?.id || 0), senderRole: 'system', senderId: null, content: `Booking #${id} cancelled by user`, readByUser: true, readByOwner: false })
  res.json({ status: 'updated' })
}

async function reviews(req, res) {
  await connect(); await ensureSeed();
  const userId = Number(req.query.userId)
  const items = await Review.find({ userId }).lean()
  res.json({ reviews: items })
}

async function createReview(req, res) {
  await connect(); await ensureSeed();
  const { userId, hotelId, rating, comment } = req.body || {}
  if (!userId || !hotelId || !rating) return res.status(400).json({ error: 'Missing fields' })
  const id = await nextIdFor('Review')
  await Review.create({ id, userId: Number(userId), hotelId: Number(hotelId), rating: Number(rating), comment: String(comment||'') })
  res.json({ status: 'created', id })
}

async function updateReview(req, res) {
  await connect(); await ensureSeed();
  const id = Number(req.params.id)
  const { rating, comment } = req.body || {}
  const r = await Review.findOne({ id })
  if (!r) return res.status(404).json({ error: 'Review not found' })
  if (rating !== undefined) r.rating = Number(rating)
  if (comment !== undefined) r.comment = String(comment)
  await r.save()
  res.json({ status: 'updated' })
}

async function deleteReview(req, res) {
  await connect(); await ensureSeed();
  const id = Number(req.params.id)
  const r = await Review.findOne({ id })
  if (!r) return res.status(404).json({ error: 'Review not found' })
  await Review.deleteOne({ id })
  res.json({ status: 'deleted' })
}

async function wishlist(req, res) {
  await connect(); await ensureSeed();
  const userId = Number(req.query.userId)
  const items = await Wishlist.find({ userId }).lean()
  res.json({ wishlist: items })
}

async function addWishlist(req, res) {
  await connect(); await ensureSeed();
  const { userId, hotelId } = req.body || {}
  if (!userId || !hotelId) return res.status(400).json({ error: 'Missing fields' })
  const exists = await Wishlist.findOne({ userId: Number(userId), hotelId: Number(hotelId) })
  if (exists) return res.status(409).json({ error: 'Exists' })
  await Wishlist.create({ userId: Number(userId), hotelId: Number(hotelId) })
  res.json({ status: 'added' })
}

async function removeWishlist(req, res) {
  await connect(); await ensureSeed();
  const hotelId = Number(req.params.hotelId)
  const userId = Number(req.query.userId)
  const exists = await Wishlist.findOne({ userId, hotelId })
  if (!exists) return res.status(404).json({ error: 'Not found' })
  await Wishlist.deleteOne({ userId, hotelId })
  res.json({ status: 'removed' })
}

module.exports = {
  bookings,
  cancelBooking,
  reviews,
  createReview,
  updateReview,
  deleteReview,
  wishlist,
  addWishlist,
  removeWishlist
}