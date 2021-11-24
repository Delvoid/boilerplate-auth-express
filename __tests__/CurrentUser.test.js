const request = require('supertest')
const SMTPServer = require('smtp-server').SMTPServer
const app = require('../app')
const connectDb = require('../db/connect')
const UserModel = require('../models/User')
const nodemailerConfig = require('../utils/nodemailerConfig')
const TokenModel = require('../models/Token')
const ObjectId = require('mongoose').Types.ObjectId

let dbConnection
let lastMail, server
let simulateSmtpFailure = false

beforeAll(async () => {
  server = new SMTPServer({
    authOptional: true,
    onData(stream, session, callback) {
      let mailBody
      stream.on('data', (data) => {
        mailBody += data.toString()
      })
      stream.on('end', () => {
        if (simulateSmtpFailure) {
          const error = new Error('Invalid mailbox')
          error.responseCode = 553
          return callback(error)
        }
        lastMail = mailBody
        callback()
      })
    },
  })

  await server.listen(nodemailerConfig.port, 'localhost')

  dbConnection = await connectDb()
  jest.setTimeout(20000)
})

afterAll(async () => {
  await dbConnection.collection('users').deleteMany({})
  await dbConnection.collection('tokens').deleteMany({})
  await dbConnection.close()
  await server.close()
  jest.setTimeout(5000)
})
beforeEach(async () => {
  simulateSmtpFailure = false
  await dbConnection.collection('users').deleteMany({})
  await dbConnection.collection('tokens').deleteMany({})
})

const registerUser = async (user = validUser) => {
  const agent = request(app).post('/api/v1/auth/register')
  return await agent.send(user)
}

const loginUser = (user = validUser) => {
  const agent = request(app).post('/api/v1/auth/login')
  return agent.send({ email: user.email, password: user.password })
}

const fineUser = async (name = validUser.name) => {
  const user = await UserModel.findOne({ name })
  return user
}

const verifyUser = async (name = validUser.name) => {
  const user = await fineUser(name)
  const agent = request(app).post('/api/v1/auth/verify-email')
  return await agent.send({ verificationToken: user.verificationToken, email: user.email })
}

const createUser = async (user = validUser) => {
  await registerUser(user)
  await verifyUser(user.name)
  const findUser = await fineUser(user.name)
  return findUser
}

const validUser = {
  name: 'Delvoid',
  email: 'delvoid.dev@gmail.com',
  password: 'Test321.',
}

describe('Get current user', () => {
  describe('GET /api/v1/users/showMe', () => {
    it('retusn 200 if logged in user ', async () => {
      await createUser()
      const user = await loginUser()
      const userCookies = user.headers['set-cookie']

      const res = await request(app).get('/api/v1/users/showMe').set('cookie', userCookies)
      expect(res.status).toBe(200)
      expect(Object.keys(res.body.user)).toEqual([
        '_id',
        'name',
        'email',
        'role',
        'isVerified',
        'createdAt',
        'updatedAt',
        'verified',
      ])
    })
    it('retusn 01 if not logged in  ', async () => {
      const res = await request(app).get('/api/v1/users/showMe')
      expect(res.status).toBe(401)
    })
  })
})
