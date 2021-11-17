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

const login = async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) throw new CustomError.BadRequest('Please provide email and password')
  // find user
  const user = await UserModel.findOne({ email })
  if (!user) throw new CustomError.Unauthenticated('Invalid credentials')
  // verify password
  const isPasswordCorrect = await user.comparePassword(password)
  if (!isPasswordCorrect) throw new CustomError.Unauthenticated('Invalid credentials')

  const tokenUser = createTokenUser(user)
  attachCookiesToResponse({ res, user: tokenUser })

  res.status(StatusCodes.OK).json({ user: tokenUser })
  // res.status(StatusCodes.OK).json({ msg: 'done' })
}

const logout = async (req, res) => {
  res.cookie('token', 'logout', {
    httpOnly: true,
    expires: new Date(Date.now() + 1000),
  })
  res.status(StatusCodes.OK).json({ msg: 'user logged out!' })
}

module.exports = {
  register,
  login,
  logout,
}
