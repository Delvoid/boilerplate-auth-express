const { StatusCodes } = require('http-status-codes')

module.exports = function UnauthenticatedException(message) {
  this.status = StatusCodes.UNAUTHORIZED
  this.message = message || 'Unathorized'
}
