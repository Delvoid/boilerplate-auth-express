const express = require('express')
const { authenticateUser } = require('../middleware/auth')
const router = express.Router()

const {
  getAllUsers,
  getUserById,
  showCurrentUser,
  updateUserPassword,
  updateUser,
  getUserTokens,
  getUserTokensById,
} = require('../controllers/userController')

router.get('/', authenticateUser, getAllUsers)
router.get('/showMe', authenticateUser, showCurrentUser)
router.patch('/updateUser', authenticateUser, updateUser)
router.patch('/updateUserPassword', authenticateUser, updateUserPassword)

router.get(['/tokens', '/tokens/:id'], authenticateUser, getUserTokens)

router.get('/:id', authenticateUser, getUserById)

module.exports = router
