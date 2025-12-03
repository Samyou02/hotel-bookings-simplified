// server.js
try {
  const c = global.console || console
  const fallback = function(){ try { process.stdout.write('\n') } catch {} }
  ;['log','error','warn','info','debug','trace'].forEach((k)=>{
    try { if (typeof c[k] !== 'function') { c[k] = fallback } } catch {}
  })
} catch {}

const express = require('express');
console.log('[Server] boot')
try { if (typeof console.log !== 'function') { console.log = function(){ } } } catch {}
try { if (typeof console.error !== 'function') { console.error = function(){ } } } catch {}
try { if (typeof console.warn !== 'function') { console.warn = function(){ } } } catch {}
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const nodemailer = require("nodemailer");   // <-- ADDED
                                             
// Create SMTP transporter (Gmail)
const transporter = nodemailer.createTransport({   // <-- ADDED
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

const { connect, isConnected } = require('./config/db');
const ensureSeed = require('./seed');
const { nextIdFor } = require('./utils/ids');
const models = require('./models');
const { Contact } = models;

const hotelsRoutes   = require('./routes/hotels');
const publicRoutes   = require('./routes/public');
const authRoutes     = require('./routes/auth');
const adminRoutes    = require('./routes/admin');
const bookingsRoutes = require('./routes/bookings');
const userRoutes     = require('./routes/user');
const ownerRoutes    = require('./routes/owner');
const messagesRoutes = require('./routes/messages');

const app = express();
let __started = false

process.on('exit', (code) => { try { console.log(`[Server] process exit ${code}`) } catch {} })
process.on('beforeExit', (code) => { try { console.log(`[Server] process beforeExit ${code}`) } catch {} })
process.on('uncaughtException', (err) => { try { console.error('[Server] uncaughtException', err?.message || err) } catch {} })
process.on('unhandledRejection', (err) => { try { console.error('[Server] unhandledRejection', (err && err.message) || String(err)) } catch {} })

console.log('[Server] setup middlewares')
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

const uploadsDir = path.join(__dirname, 'uploads');
console.log('[Server] ensure uploads dir')
try {
  fs.mkdirSync(uploadsDir, { recursive: true });
} catch (err) {
  console.warn('[Server] could not ensure uploads directory:', err);
}

app.get('/uploads/:name', (req, res) => {
  try {
    const name = path.basename(String(req.params.name || ''));
    const filePath = path.join(uploadsDir, name);
    if (fs.existsSync(filePath)) {
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
      return res.sendFile(filePath);
    }
    const transparentPngBase64 =
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=';
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    return res
      .status(200)
      .send(Buffer.from(transparentPngBase64, 'base64'));
  } catch (e) {
    return res.status(404).end();
  }
});

app.use('/uploads', express.static(uploadsDir));
console.log('[Server] static uploads ready')

const portEnv = Number(process.env.PORT || 5000)
let port = Number.isFinite(portEnv) && portEnv > 0 ? portEnv : 5000
console.log(`[Server] init port ${port}`)
try {
  console.log(`[Server] attempting to listen on ${port}`)
  app.listen(port, () => {
    __started = true
    console.log(`Backend running on http://localhost:${port}`)
  })
} catch (e) {
  console.error('[Server] listen exception', e?.message || e)
}

setTimeout(async () => {
  try {
    await connect();
    await ensureSeed();
    await Promise.all(
      Object.values(models).map((m) =>
        typeof m?.init === 'function' ? m.init() : Promise.resolve()
      )
    );
    console.log(`[Server] DB health: ${isConnected()}`);
  } catch (e) {
    console.error('[Server] DB init failed', e?.message || e);
  }
}, 0);

// removed held-expiry timer: bookings create directly as 'pending'

app.get('/', async (req, res) => {
  await connect();
  await ensureSeed();
  res.json({ status: 'ok' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/db/health', async (req, res) => {
  try {
    await connect();
    res.json({ connected: isConnected() });
  } catch (e) {
    res.json({ connected: false });
  }
});

// ---------------------
// CONTACT API + EMAIL
// ---------------------
app.post('/api/contact', async (req, res) => {
  await connect();
  await ensureSeed();
  const { firstName, lastName, email, subject, message } = req.body || {};

  if (!email || !message) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const id = await nextIdFor('Contact');
  await Contact.create({
    id,
    firstName,
    lastName,
    email,
    subject,
    message,
  });

  // ----- SEND EMAIL USING SMTP (OPTIONAL) -----
  try {
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: email,  // send to user
      subject: `Thanks for contacting us`,
      text: `We received your message: ${message}`,
    });

    console.log("Email sent successfully");
  } catch (err) {
    console.log("Email send error:", err.message);
  }

  res.json({ status: 'received', id });
});

app.use('/api/hotels', hotelsRoutes);
app.use('/api', publicRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/user', userRoutes);
app.use('/api/owner', ownerRoutes);
app.use('/api/messages', messagesRoutes);

// single start handled in DB-init block above
