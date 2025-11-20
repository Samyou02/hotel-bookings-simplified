const express = require('express')
const router = express.Router()
const hotels = require('../controllers/hotelsController')

router.get('/featured', hotels.featured)
router.get('/about', hotels.about)

module.exports = router