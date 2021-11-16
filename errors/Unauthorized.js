const { StatusCodes } = require('http-status-codes')

module.exports = function NotFoundException(message) {
  this.status = StatusCodes.FORBIDDEN
  this.message = message || 'Forbidden'
}
