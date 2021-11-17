const crypto = require('crypto')
const UserModel = require('../models/User')
const { StatusCodes } = require('http-status-codes')
const CustomError = require('../errors')
const { attachCookiesToResponse, createTokenUser, sendVerificationEmail } = require('../utils')
const TokenModel = require('../models/Token')

const register = async (req, res) => {
  const { name, email, password } = req.body

  // Check email in exists
  const emailAlreadyExists = await UserModel.findOne({ email })
  if (emailAlreadyExists) throw new CustomError.BadRequest('Email already exists')

  const verificationToken = crypto.randomBytes(40).toString('hex')
  const user = await UserModel.create({ name, email, password, verificationToken })

  await sendVerificationEmail({
    name: user.name,
    email: user.email,
    verificationToken: user.verificationToken,
  })

  res.status(StatusCodes.CREATED).json({
    msg: 'Success! Please check your email to verify account',
    token: user.verificationToken,
  })
}

const verifyEmail = async (req, res) => {
  const { verificationToken, email } = req.body
  if (!verificationToken || !email) throw new CustomError.BadRequest()

  const user = await UserModel.findOne({ email })
  if (!user) throw new CustomError.Unauthenticated('Verification Failed')

  if (user.verificationToken !== verificationToken) {
    throw new CustomError.Unauthenticated('Verification Failed')
  }

  user.isVerified = true
  user.verified = Date.now()
  user.verificationToken = ''

  await user.save()

  res.status(StatusCodes.OK).json({ msg: 'Email Verified', user })
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
  // create refresh token
  let refreshToken = ''
  // check for existing token
  const existingToken = await TokenModel.findOne({ user: user._id })
  if (existingToken) {
    const { isValid } = existingToken
    if (!isValid) throw new CustomError.Unauthenticated('Invalid Credentials')
    refreshToken = existingToken.refreshToken
    attachCookiesToResponse({ res, user: tokenUser, refreshToken })
    return res.status(StatusCodes.OK).json({ user: tokenUser })
  }

  refreshToken = crypto.randomBytes(40).toString('hex')
  const userAgent = req.headers['user-agent']
  const ip = req.ip
  const userToken = {
    refreshToken,
    ip,
    userAgent,
    user: user._id,
  }

  await TokenModel.create(userToken)

  attachCookiesToResponse({ res, user: tokenUser, refreshToken })
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
  verifyEmail,
  login,
  logout,
}
