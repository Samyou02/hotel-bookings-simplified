const express = require('express')
const router = express.Router()
const messages = require('../controllers/messagesController')

router.get('/threads', messages.threads)
router.get('/thread/:id/messages', messages.threadMessages)
router.post('/thread/:id/send', messages.send)
router.post('/thread/:id/read', messages.markRead)
router.get('/unread-count', messages.unreadCount)

module.exports = router