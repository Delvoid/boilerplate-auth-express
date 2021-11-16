require('dotenv').config()
require('express-async-errors')

// express
const express = require('express')
const CustomError = require('./errors')
const errors = require('./errors')

const app = express()
// other packages
const morgan = require('morgan')
const cookieParser = require('cookie-parser')
const helmet = require('helmet')
const xss = require('xss-clean')
const cors = require('cors')

// database
const connectDB = require('./db/connect')

// routes
// TODO auth
// TODO users

//middleware
// TODO auth
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

app.use(notFoundMiddleware)
app.use(errorHandlerMiddleware)

const port = process.env.PORT || 5000
const start = async () => {
  try {
    //conect to db
    await connectDB(process.env.MONGO_URI)
    app.listen(port, () => console.log(`Server is listening on port ${port}...`))
  } catch (error) {
    console.log(error)
  }
}

start()
