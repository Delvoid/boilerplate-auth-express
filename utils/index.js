const { createJWT, isTokenValid, attachCookiesToResponse } = require('./jwt')
const createTokenUser = require('./createTokenUser')
const sendVerificationEmail = require('./sendVerificationEmail')
const sendResetPasswordEmail = require('./sendResetPasswordEmail')
const createHash = require('./createHash')
const checkPermissions = require('./checkPermissions')

module.exports = {
  createJWT,
  isTokenValid,
  attachCookiesToResponse,
  createTokenUser,
  sendVerificationEmail,
  sendResetPasswordEmail,
  createHash,
  checkPermissions,
}
