const express = require('express')
const router = express.Router()

const { register, verifyEmail, login, logout } = require('../controllers/authController')

router.post('/register', register)
router.post('/verify-email', verifyEmail)
router.post('/login', login)
router.get('/logout', logout)

module.exports = router
