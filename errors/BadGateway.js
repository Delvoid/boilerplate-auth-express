const { StatusCodes } = require('http-status-codes')

module.exports = function BadGatewayException(message) {
  this.status = StatusCodes.BAD_GATEWAY
  this.message = message || 'Bad gateway'
}
