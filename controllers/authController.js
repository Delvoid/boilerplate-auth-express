const crypto = require('crypto')
const UserModel = require('../models/User')
const { StatusCodes } = require('http-status-codes')
const CustomError = require('../errors')
const {
  attachCookiesToResponse,
  createTokenUser,
  sendVerificationEmail,
  sendResetPasswordEmail,
  createHash,
} = require('../utils')
const TokenModel = require('../models/Token')

const register = async (req, res) => {
  const { name, email, password } = req.body

  // Check email in exists
  const emailAlreadyExists = await UserModel.findOne({ email })
  if (emailAlreadyExists) throw new CustomError.BadRequest('Email already exists')

  // first registered user is an admin
  const isFirstAccount = (await UserModel.countDocuments({})) === 0
  const role = isFirstAccount ? 'admin' : 'user'

  const verificationToken = crypto.randomBytes(40).toString('hex')
  const user = await UserModel.create({ name, email, password, role, verificationToken })

  try {
    await sendVerificationEmail({
      name: user.name,
      email: user.email,
      verificationToken: user.verificationToken,
    })
  } catch (error) {
    await UserModel.findByIdAndDelete(user._id)
    throw new CustomError.BadGateway('Invalid mailbox')
  }

  res.status(StatusCodes.CREATED).json({
    msg: 'Success! Please check your email to verify account',
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

  if (!user.isVerified) {
    throw new CustomError.Unauthenticated('Please verify your email')
  }

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
  await TokenModel.findOneAndDelete({ user: req.user.userId })

  res.cookie('accessToken', 'logout', {
    httpOnly: true,
    expires: new Date(Date.now()),
  })
  res.cookie('refreshToken', 'logout', {
    httpOnly: true,
    expires: new Date(Date.now()),
  })
  res.status(StatusCodes.OK).json({ msg: 'user logged out!' })
}

const forgotPassword = async (req, res) => {
  const { email } = req.body
  if (!email) throw new CustomError.BadRequest('Please provide valid email')

  const user = await UserModel.findOne({ email })
  if (user) {
    const passwordToken = crypto.randomBytes(70).toString('hex')
    //send email
    await sendResetPasswordEmail({
      name: user.name,
      email: user.email,
      token: passwordToken,
    })

    const tenMinutes = 1000 * 60 * 10
    const passwordTokenExpirationDate = new Date(Date.now() + tenMinutes)

    user.passwordToken = createHash(passwordToken)
    user.passwordTokenExpirationDate = passwordTokenExpirationDate
    await user.save()
  }

  res.status(StatusCodes.OK).json({
    msg: 'If that email address is in our database, we will send you an email to reset your password.',
  })
}
const resetPassword = async (req, res) => {
  const { email, passwordToken, password } = req.body
  if (!email || !passwordToken || !password) {
    throw new CustomError.BadRequest('Please provide all values')
  }
  const user = await UserModel.findOne({ email })
  if (user) {
    const currentDate = new Date()
    if (user.passwordTokenExpirationDate < currentDate)
      throw new CustomError.Expired('Password link has expired, please try again')

    if (
      user.passwordToken === createHash(passwordToken) &&
      user.passwordTokenExpirationDate > currentDate
    ) {
      user.password = password
      user.passwordToken = null
      user.passwordTokenExpirationDate = null
      await user.save()
    }
  }
  res.send('Password reset')
}

module.exports = {
  register,
  verifyEmail,
  login,
  logout,
  forgotPassword,
  resetPassword,
}
