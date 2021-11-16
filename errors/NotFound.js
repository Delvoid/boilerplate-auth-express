const { StatusCodes } = require('http-status-codes')

module.exports = function NotFoundException(message) {
  this.status = StatusCodes.NOT_FOUND
  this.message = message || 'Not found'
}
