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
const validUser2 = {
  name: 'User2',
  email: 'user2@gmail.com',
  password: 'Test321.',
}

describe('Get User Tokens', () => {
  describe('GET /api/v1/users/tokens/:id', () => {
    it('returns 200 if valid auth', async () => {
      await createUser()
      const adminCookies = await loginUser()
      const cookies = adminCookies.headers['set-cookie']
      const res = await request(app).get('/api/v1/users/tokens').set('cookie', cookies)

      expect(res.status).toBe(200)
    })
    it('returns logged in users tokens if no id is passed', async () => {
      await createUser()

      await createUser(validUser2)
      const userCookies = await loginUser(validUser2)
      const cookies = userCookies.headers['set-cookie']
      const res = await request(app).get('/api/v1/users/tokens').set('cookie', cookies)
      const user = await UserModel.findOne({ name: 'User2' })

      expect(res.status).toBe(200)
      expect(res.body.tokens[0].user).toBe(user._id.toString())
    })
    it('returns logged in users tokens if  id is passed', async () => {
      await createUser()
      await createUser(validUser2)
      const userCookies = await loginUser()
      const cookies = userCookies.headers['set-cookie']
      const user = await UserModel.findOne({})
      const res = await request(app).get(`/api/v1/users/tokens/${user._id}`).set('cookie', cookies)

      expect(res.status).toBe(200)
      expect(res.body.tokens[0].user).toBe(user._id.toString())
    })
    it('returns 400 if invalid id', async () => {
      await createUser()
      await createUser(validUser2)
      const userCookies = await loginUser()
      const cookies = userCookies.headers['set-cookie']

      const res = await request(app).get(`/api/v1/users/tokens/notvalid`).set('cookie', cookies)

      expect(res.status).toBe(400)
    })
    it('returns 401 if a user tries to get another users tokens', async () => {
      await createUser()

      await createUser(validUser2)
      const userCookies = await loginUser(validUser2)
      const cookies = userCookies.headers['set-cookie']
      const user = await UserModel.findOne({ name: 'Delvoid' })
      const res = await request(app).get(`/api/v1/users/tokens/${user._id}`).set('cookie', cookies)

      expect(res.status).toBe(403)
    })
    it('returns 200 if a admin tries to get other users tokens', async () => {
      await createUser()
      await createUser(validUser2)
      const userCookies = await loginUser()
      const cookies = userCookies.headers['set-cookie']
      const user = await UserModel.findOne({ name: 'User2' })
      const res = await request(app).get(`/api/v1/users/tokens/${user._id}`).set('cookie', cookies)

      expect(res.status).toBe(200)
    })
  })
})
