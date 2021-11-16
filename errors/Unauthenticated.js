const { StatusCodes } = require('http-status-codes')

module.exports = function NotFoundException(message) {
  this.status = StatusCodes.UNAUTHORIZED
  this.message = message || 'Unathorized'
}
