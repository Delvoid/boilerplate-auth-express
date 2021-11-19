const { StatusCodes } = require('http-status-codes')

module.exports = function BadRequestException(message) {
  this.status = StatusCodes.BAD_REQUEST
  this.message = message || 'Bad request'
}
