const { connect } = require('../config/db')
const ensureSeed = require('../seed')
const { nextIdFor } = require('../utils/ids')
const { User } = require('../models')
const crypto = require('crypto')
let mailer = null
try { mailer = require('nodemailer') } catch { mailer = null }
const fs = require('fs')
const path = require('path')

function ensureUploadsDir() { const uploadsDir = path.join(__dirname, '../uploads'); try { fs.mkdirSync(uploadsDir, { recursive: true }) } catch {} return uploadsDir }
function dataUrlToBuffer(dataUrl) { if (typeof dataUrl !== 'string') return null; const match = dataUrl.match(/^data:(.+);base64,(.+)$/); if (!match) return null; const mime = match[1]; const base64 = match[2]; const buf = Buffer.from(base64, 'base64'); let ext = 'png'; if (mime.includes('jpeg')) ext = 'jpg'; else if (mime.includes('png')) ext = 'png'; else if (mime.includes('gif')) ext = 'gif'; else if (mime.includes('webp')) ext = 'webp'; return { buf, ext } }

async function signin(req, res) {
  try {
    await connect(); await ensureSeed();
    const { email, password } = req.body || {}
    if (!email || !password) return res.status(400).json({ error: 'Missing credentials' })
    const user = await User.findOne({ email }).lean()
    if (!user || user.password !== password) return res.status(401).json({ error: 'Invalid credentials' })
    if (user.blocked) return res.status(403).json({ error: 'User is blocked' })
    res.json({ token: 'mock-token', user: { id: user.id, email: user.email, role: user.role, isApproved: user.isApproved !== false, blocked: !!user.blocked } })
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
  const { email, password, firstName, lastName, phone, fullName, dob, address, idType, idNumber, idIssueDate, idExpiryDate, idDocImage } = req.body || {}
  if (!email || !password) return res.status(400).json({ error: 'Missing fields' })
  const existing = await User.findOne({ email })
  if (existing) return res.status(409).json({ error: 'Email exists' })
  const id = await nextIdFor('User')
  let idDocUrl = ''
  try {
    const parsed = dataUrlToBuffer(idDocImage)
    if (parsed) {
      const uploadsDir = ensureUploadsDir()
      const filename = `user-doc-${id}-${Date.now()}.${parsed.ext}`
      const filePath = path.join(__dirname, '../uploads', filename)
      try { fs.writeFileSync(filePath, parsed.buf) } catch {}
      idDocUrl = `/uploads/${filename}`
    }
  } catch {}
  await User.create({ id, email, password, firstName, lastName, phone, fullName, dob, address, idType, idNumber, idIssueDate, idExpiryDate, idDocUrl, role: 'user', isApproved: true })
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

async function forgot(req, res) {
  try {
    await connect(); await ensureSeed();
    const { email } = req.body || {}
    if (!email) return res.status(400).json({ error: 'Missing email' })
    const u = await User.findOne({ email })
    if (!u) {
      return res.json({ status: 'sent' })
    }
    const token = crypto.randomBytes(20).toString('hex')
    u.resetToken = token
    u.resetExpires = new Date(Date.now() + 60 * 60 * 1000)
    await u.save()
    const frontBase = (process.env.SERVER_URL || (req.headers.origin && String(req.headers.origin)) || 'http://localhost:8080')
    const link = `${frontBase}/reset-password?token=${token}`
    if (mailer) {
      try {
        const transporter = mailer.createTransport({
          host: process.env.SMTP_HOST,
          service: /gmail\.com$/i.test(String(process.env.SMTP_HOST||'')) ? 'gmail' : undefined,
          port: Number(process.env.SMTP_PORT || 587),
          secure: String(process.env.SMTP_SECURE||'false') === 'true',
          auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        })
        await transporter.sendMail({ from: process.env.SMTP_USER, to: email, subject: 'Reset your password', text: `Create a new password: ${link}`, html: `<p>Create a new password:</p><p><a href="${link}">${link}</a></p>` })
      } catch (e) {
        console.warn('[ForgotPassword] email send failed', e?.message || e)
      }
    }
    res.json({ status: 'sent', link })
  } catch (e) {
    console.error('[ForgotPassword] error', e?.message || e)
    res.status(503).json({ error: 'Database unavailable' })
  }
}

async function reset(req, res) {
  try {
    await connect(); await ensureSeed();
    const { token, password } = req.body || {}
    if (!token || !password) return res.status(400).json({ error: 'Missing fields' })
    const u = await User.findOne({ resetToken: token })
    if (!u) return res.status(404).json({ error: 'Invalid token' })
    if (!u.resetExpires || new Date(u.resetExpires).getTime() < Date.now()) return res.status(400).json({ error: 'Token expired' })
    u.password = String(password)
    u.resetToken = undefined
    u.resetExpires = undefined
    await u.save()
    res.json({ status: 'updated' })
  } catch (e) {
    console.error('[ResetPassword] error', e?.message || e)
    res.status(503).json({ error: 'Database unavailable' })
  }
}

module.exports.forgot = forgot
module.exports.reset = reset
