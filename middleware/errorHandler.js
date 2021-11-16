const { StatusCodes } = require('http-status-codes')
const errorHandlerMiddleware = (err, req, res, next) => {
  let validationErrors
  if (err.errors) {
    validationErrors = {}
    err.errors.forEach((error) => (validationErrors[error.param] = req.t(error.msg)))
  }
  let customError = {
    // set default
    path: req.originalUrl,
    timestamp: new Date().getTime(),
    statusCode: err.status || StatusCodes.INTERNAL_SERVER_ERROR,
    msg: err.message || 'Something went wrong try again later',
  }

  return res.status(customError.statusCode).json(customError)
}

module.exports = errorHandlerMiddleware
