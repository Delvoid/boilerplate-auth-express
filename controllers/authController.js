const crypto = require('crypto')
const UserModel = require('../models/User')
const { StatusCodes } = require('http-status-codes')
const CustomError = require('../errors')
const { attachCookiesToResponse, createTokenUser } = require('../utils')

const register = async (req, res) => {
  const { name, email, password } = req.body

  // Check email in exists
  const emailAlreadyExists = await UserModel.findOne({ email })
  if (emailAlreadyExists) throw new CustomError.BadRequest('Email already exists')

  const verificationToken = crypto.randomBytes(40).toString('hex')
  const user = await UserModel.create({ name, email, password, verificationToken })

  const tokenUser = createTokenUser(user)
  attachCookiesToResponse({ res, user: tokenUser })

  res.status(StatusCodes.CREATED).json(user)
  // res.status(StatusCodes.CREATED).json({msg: 'Success! Please check your email to verify account', token: user.verificationToken})
}

const login = (req, res) => {
  res.send('login route')
}

const logout = (req, res) => {
  res.send('logout route')
}

module.exports = {
  register,
  login,
  logout,
}
