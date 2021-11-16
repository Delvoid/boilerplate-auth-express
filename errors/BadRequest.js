const { StatusCodes } = require('http-status-codes')

module.exports = function NotFoundException(message) {
  this.status = StatusCodes.BAD_REQUEST
  this.message = message || 'Bad request'
}
