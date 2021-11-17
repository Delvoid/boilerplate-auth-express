const { StatusCodes } = require('http-status-codes')

module.exports = function UnauthorizedException(message) {
  this.status = StatusCodes.FORBIDDEN
  this.message = message || 'Forbidden'
}
