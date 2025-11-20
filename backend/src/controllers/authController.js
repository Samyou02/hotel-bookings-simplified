const { connect } = require('../config/db')
const ensureSeed = require('../seed')
const { nextIdFor } = require('../utils/ids')
const { User } = require('../models')

async function signin(req, res) {
  try {
    await connect(); await ensureSeed();
    const { email, password } = req.body || {}
    if (!email || !password) return res.status(400).json({ error: 'Missing credentials' })
    const user = await User.findOne({ email }).lean()
    if (!user || user.password !== password) return res.status(401).json({ error: 'Invalid credentials' })
    res.json({ token: 'mock-token', user: { id: user.id, email: user.email, role: user.role, isApproved: user.isApproved !== false } })
  } catch (e) {
    const { email, password } = req.body || {}
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@staybook.com'
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123'
    if (email === adminEmail && password === adminPassword) return res.json({ token: 'mock-token', user: { id: 1, email: adminEmail, role: 'admin', isApproved: true } })
    res.status(503).json({ error: 'Database unavailable' })
  }
}

async function register(req, res) {
  await connect(); await ensureSeed();
  const { email, password, firstName, lastName, phone } = req.body || {}
  if (!email || !password) return res.status(400).json({ error: 'Missing fields' })
  const existing = await User.findOne({ email })
  if (existing) return res.status(409).json({ error: 'Email exists' })
  const id = await nextIdFor('User')
  await User.create({ id, email, password, firstName, lastName, phone, role: 'user', isApproved: true })
  res.json({ status: 'created', user: { id, email, role: 'user' } })
}

async function seedAdmin(req, res) {
  await connect(); await ensureSeed();
  const email = process.env.ADMIN_EMAIL || 'admin@staybook.com'
  const password = process.env.ADMIN_PASSWORD || 'admin123'
  const exists = await User.findOne({ email }).lean()
  if (exists) return res.json({ status: 'exists', user: { id: exists.id, email: exists.email, role: exists.role } })
  const id = await nextIdFor('User')
  await User.create({ id, email, password, role: 'admin', isApproved: true, firstName: 'Admin', lastName: 'User' })
  res.json({ status: 'seeded', user: { id, email, role: 'admin' } })
}

module.exports = { signin, register, seedAdmin }