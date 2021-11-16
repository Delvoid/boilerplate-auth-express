const { StatusCodes } = require('http-status-codes')
const errorHandlerMiddleware = (err, req, res, next) => {
  let validationErrors
  if (err.errors) {
    const { errors } = err
    validationErrors = {}
    Object.entries(errors).forEach(([key, value]) => {
      validationErrors[key] = value.properties.message
    })
  }
  let customError = {
    // set default
    path: req.originalUrl,
    timestamp: new Date().getTime(),
    statusCode: err.status || StatusCodes.INTERNAL_SERVER_ERROR,
    msg: err.message || 'Something went wrong try again later',
    validationErrors,
  }

  return res.status(customError.statusCode).json(customError)
}

module.exports = errorHandlerMiddleware
