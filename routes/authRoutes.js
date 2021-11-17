const express = require('express')
const { authenticateUser } = require('../middleware/auth')

const router = express.Router()

const {
  register,
  verifyEmail,
  login,
  logout,
  forgotPassword,
  resetPassword,
} = require('../controllers/authController')

router.post('/register', register)
router.post('/verify-email', verifyEmail)
router.post('/login', login)
router.delete('/logout', authenticateUser, logout)
router.post('/forgot-password', forgotPassword)
router.post('/reset-password', resetPassword)

module.exports = router
