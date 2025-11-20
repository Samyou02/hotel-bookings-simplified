const dotenv = require('dotenv')
dotenv.config()
const { connect } = require('./config/db')
const { nextIdFor } = require('./utils/ids')
const { User } = require('./models')

;(async () => {
  try {
    await connect()
    const email = process.env.ADMIN_EMAIL || 'admin@staybook.com'
    const password = process.env.ADMIN_PASSWORD || 'admin123'
    const exists = await User.findOne({ email }).lean()
    if (exists) {
      console.log('[UserSeed] exists ' + email)
    } else {
      const id = await nextIdFor('User')
      await User.create({ id, email, password, role: 'admin', isApproved: true, firstName: 'Admin', lastName: 'User' })
      console.log('[UserSeed] seeded ' + email)
    }
    process.exit(0)
  } catch (e) {
    console.error('[UserSeed] error', e?.message || e)
    process.exit(1)
  }
})()