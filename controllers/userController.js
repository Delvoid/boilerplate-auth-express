const { StatusCodes } = require('http-status-codes')
const CustomError = require('../errors')
const UserModel = require('../models/User')
const ObjectId = require('mongoose').Types.ObjectId
const TokenModel = require('../models/Token')

const { attachCookiesToResponse, createTokenUser, checkPermissions } = require('../utils')

const getAllUsers = async (req, res) => {
  const users = await UserModel.find({}).select('-password')
  if (!users) return res.status(StatusCodes.OK).json([])
  res.status(StatusCodes.OK).json({ users })
}
const getUserById = async (req, res) => {
  const { id } = req.params
  if (!ObjectId.isValid(id)) throw new CustomError.NotFound(`No user with id: ${id}`)
  const user = await UserModel.findById(id).select('-password')
  if (!user) throw new CustomError.NotFound(`No user with id: ${id}`)
  checkPermissions(req.user, user._id)

  res.status(StatusCodes.OK).json({ user })
}

const showCurrentUser = async (req, res) => {
  const user = await UserModel.findById(req.user.userId).select({
    password: 0,
    verificationToken: 0,
    passwordToken: 0,
    __v: 0,
  })
  res.status(StatusCodes.OK).json({ user })
}

const updateUser = async (req, res) => {
  const { name, email } = req.body
  if (!name || !email) throw new CustomError.BadRequest('Please provide all values')
  const user = await UserModel.findById(req.user.userId)

  user.email = email
  user.name = name

  await user.save()

  const tokenUser = createTokenUser(user)
  attachCookiesToResponse({ res, user: tokenUser })
  res.status(StatusCodes.OK).json({ user: tokenUser })
}
const updateUserPassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body
  if (!oldPassword || !newPassword) throw new CustomError.BadRequest('Please provide both values')

  const user = await UserModel.findById(req.user.userId)

  const isPasswordCorrect = await user.comparePassword(oldPassword)
  if (!isPasswordCorrect) throw new CustomError.Unauthenticated('Invalid credentials')

  user.password = newPassword
  await user.save()

  res.status(StatusCodes.OK).json({ msg: 'Success! Password Updated.' })
}

const getUserTokens = async (req, res) => {
  let { id } = req.params
  if (!id) id = req.user.userId
  if (id) {
    if (!ObjectId.isValid(id)) throw new CustomError.BadRequest('Invalid request')
  }
  const tokens = await TokenModel.find({
    user: id,
  })
  checkPermissions(req.user, user._id)
  res.status(StatusCodes.OK).json({ tokens })
}

module.exports = {
  getAllUsers,
  getUserById,
  showCurrentUser,
  updateUser,
  updateUserPassword,
  getUserTokens,
}
