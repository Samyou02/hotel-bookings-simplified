const express = require('express')
const router = express.Router()
const bookings = require('../controllers/bookingsController')

router.post('/', bookings.create)
router.get('/invoice/:id', bookings.invoice)

module.exports = router