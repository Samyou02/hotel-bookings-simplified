const express = require('express')
const router = express.Router()
const auth = require('../controllers/authController')

router.post('/signin', auth.signin)
router.post('/register', auth.register)
router.get('/seed/admin', auth.seedAdmin)

module.exports = router