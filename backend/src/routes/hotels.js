const express = require('express')
const router = express.Router()
const hotels = require('../controllers/hotelsController')

router.get('/', hotels.list)
router.get('/:id', hotels.getById)
router.get('/:id/reviews', hotels.getReviews)

module.exports = router