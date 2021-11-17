const { StatusCodes } = require('http-status-codes')

module.exports = function ExpiredException(message) {
  this.status = StatusCodes.GONE
  this.message = message || 'No longer available'
}
