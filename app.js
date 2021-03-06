require('dotenv').config()
require('express-async-errors')

// express
const express = require('express')
const errors = require('./errors')

const app = express()
// other packages
const morgan = require('morgan')
const cookieParser = require('cookie-parser')
const helmet = require('helmet')
const xss = require('xss-clean')
const cors = require('cors')

// routes
const authRoutes = require('./routes/authRoutes')
const userRoutes = require('./routes/userRoutes')

//middleware
const { authenticateUser } = require('./middleware/auth')
const notFoundMiddleware = require('./middleware/notFound')
const errorHandlerMiddleware = require('./middleware/errorHandler')

app.use(helmet())
app.use(cors())
app.use(xss())
app.use(morgan('tiny'))

app.use(express.json())
app.use(cookieParser(process.env.JWT_SECRET))

app.use('/test', (req, res) => {
  res.send('Test route')
})

app.use('/api/v1/dashboard', authenticateUser, (req, res) => {
  res.send('Dashboard')
})

app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/users', userRoutes)

app.use(notFoundMiddleware)
app.use(errorHandlerMiddleware)

module.exports = app
