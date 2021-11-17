const { StatusCodes } = require('http-status-codes')

module.exports = function BadRequestException(message) {
  this.status = StatusCodes.NOT_FOUND
  this.message = message || 'Not found'
}
