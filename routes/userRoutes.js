const express = require('express')
const { authenticateUser, authorizePermissions } = require('../middleware/auth')
const router = express.Router()

const {
  getAllUsers,
  getUserById,
  showCurrentUser,
  updateUserPassword,
  updateUser,
  getUserTokens,
} = require('../controllers/userController')

router.get('/', authenticateUser, authorizePermissions('admin'), getAllUsers)
router.get('/showMe', authenticateUser, showCurrentUser)
router.patch('/updateUser', authenticateUser, updateUser)
router.patch('/updateUserPassword', authenticateUser, updateUserPassword)

router.get(['/tokens', '/tokens/:id'], authenticateUser, getUserTokens)

router.get('/:id', authenticateUser, getUserById)

module.exports = router
