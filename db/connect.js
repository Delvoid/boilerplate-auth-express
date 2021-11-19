const mongoose = require('mongoose')

async function connectDb() {
  try {
    const db = await mongoose.connect(process.env.MONGO_URI)
    // console.log('Mongodb connected')
    return db.connection
  } catch (error) {
    console.log(error)
    process.exit(1)
  }
}

module.exports = connectDb
