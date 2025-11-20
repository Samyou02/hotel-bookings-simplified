const express = require('express')
const router = express.Router()
const user = require('../controllers/userController')
const bookings = require('../controllers/bookingsController')

router.get('/bookings', user.bookings)
router.post('/bookings/:id/cancel', user.cancelBooking)
router.get('/invoices/:id', bookings.invoice)

router.get('/reviews', user.reviews)
router.post('/reviews', user.createReview)
router.post('/reviews/:id', user.updateReview)
router.delete('/reviews/:id', user.deleteReview)

router.get('/wishlist', user.wishlist)
router.post('/wishlist', user.addWishlist)
router.delete('/wishlist/:hotelId', user.removeWishlist)

module.exports = router