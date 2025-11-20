const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
dotenv.config()
const { connect, isConnected } = require('./config/db')
const ensureSeed = require('./seed')
const { nextIdFor } = require('./utils/ids')
const models = require('./models')
const { Contact } = models

const hotelsRoutes = require('./routes/hotels')
const publicRoutes = require('./routes/public')
const authRoutes = require('./routes/auth')
const adminRoutes = require('./routes/admin')
const bookingsRoutes = require('./routes/bookings')
const userRoutes = require('./routes/user')
const ownerRoutes = require('./routes/owner')

const app = express()
app.use(cors())
app.use(express.json())

const port =5000

;(async () => {
  try {
    await connect()
    await ensureSeed()
    await Promise.all(Object.values(models).map(m => typeof m?.init === 'function' ? m.init() : Promise.resolve()))
    console.log(`[Server] DB health: ${isConnected()}`)
    app.listen(port, () => {
      console.log(`Backend running on http://localhost:${port}`)
      console.log(`[Server] DB connected: ${isConnected()}`)
    })
  } catch (e) {
    console.error('[Server] DB init failed', e?.message || e)
  }
})()

app.get('/', async (req, res) => {
  await connect(); await ensureSeed();
  res.json({ status: 'ok' })
})

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.get('/api/db/health', async (req, res) => {
  try {
    await connect()
    res.json({ connected: isConnected() })
  } catch (e) {
    res.json({ connected: false })
  }
})

app.post('/api/contact', async (req, res) => {
  await connect(); await ensureSeed();
  const { firstName, lastName, email, subject, message } = req.body || {}
  if (!email || !message) return res.status(400).json({ error: 'Missing required fields' })
  const id = await nextIdFor('Contact')
  await Contact.create({ id, firstName, lastName, email, subject, message })
  res.json({ status: 'received', id })
})

app.use('/api/hotels', hotelsRoutes)
app.use('/api', publicRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/bookings', bookingsRoutes)
app.use('/api/user', userRoutes)
app.use('/api/owner', ownerRoutes)