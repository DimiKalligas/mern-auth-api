const express = require('express')
const router = express.Router()

// import controller
const { requireSignin, adminMiddleware } = require('../controllers/auth')
const { read, update } = require('../controllers/user')

// this endpoint is about how to read a user's profile
router.get('/user/:id', requireSignin, read)
router.put('/user/update', requireSignin, update)
// How to restrict routes for specific roles (here: only if admin) (look: server/controllers/auth)
router.put('/admin/update', requireSignin, adminMiddleware, update)

module.exports = router
