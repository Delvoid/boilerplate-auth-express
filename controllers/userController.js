const { StatusCodes } = require('http-status-codes')
const CustomError = require('../errors')
const UserModel = require('../models/User')
const ObjectId = require('mongoose').Types.ObjectId

const {
  attachCookiesToResponse,
  createTokenUser,
  sendVerificationEmail,
  sendResetPasswordEmail,
  createHash,
} = require('../utils')

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
  res.status(StatusCodes.OK).json({ user })
}
const showCurrentUser = (req, res) => {
  res.send('show current user')
}
const updateUser = (req, res) => {
  res.send('update user users')
}
const updateUserPassword = (req, res) => {
  res.send('update password users')
}

module.exports = {
  getAllUsers,
  getUserById,
  showCurrentUser,
  updateUser,
  updateUserPassword,
}
