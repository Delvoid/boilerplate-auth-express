const request = require('supertest')
const SMTPServer = require('smtp-server').SMTPServer
const app = require('../app')
const connectDb = require('../db/connect')
const UserModel = require('../models/User')
const nodemailerConfig = require('../utils/nodemailerConfig')
const TokenModel = require('../models/Token')

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

const getFirstUser = async () => {
  const user = await UserModel.findOne({})
  return user
}

const verifyUser = async () => {
  const user = await getFirstUser()
  const agent = request(app).post('/api/v1/auth/verify-email')
  return await agent.send({ verificationToken: user.verificationToken, email: user.email })
}

const createUser = async () => {
  await registerUser()
  await verifyUser()
  const user = await getFirstUser()
  return user
}

const forgotPassword = async (user = validUser) => {
  const agent = request(app).post('/api/v1/auth/forgot-password')
  return await agent.send({ email: user.email })
}

const validUser = {
  name: 'Delvoid',
  email: 'delvoid.dev@gmail.com',
  password: 'Test321.',
}

describe('Forgot Password', () => {
  describe('Post /api/v1/auth/forgot-password', () => {
    it('returns 200', async () => {
      await createUser()
      const res = await forgotPassword()

      expect(res.status).toBe(200)
    })
    it('creates password reset token on valid email', async () => {
      await createUser()
      const res = await forgotPassword()
      const user = await UserModel.findOne({})

      expect(user.passwordToken).toEqual(expect.any(String))
    })
    it('creates passwordTokenExpirationDate on valid user', async () => {
      const dateNow = new Date(Date.now()).getTime()
      await createUser()
      const res = await forgotPassword()
      const user = await UserModel.findOne({})

      const expireDate = new Date(user.passwordTokenExpirationDate).getTime()

      expect(user.passwordTokenExpirationDate).toEqual(expect.any(Date))
      expect(expireDate).toBeGreaterThan(dateNow)
    })
    it('returns 400 if invalid email', async () => {
      await createUser()
      const res = await forgotPassword({ ...validUser, email: '' })

      expect(res.status).toBe(400)
    })
    it('sends a forgot password email with passwordToken', async () => {
      await createUser()
      await forgotPassword()
      const users = await UserModel.find({})
      const savedUser = users[0]

      expect(lastMail).toContain(savedUser.email)
      expect(lastMail).toContain('token')
      expect(lastMail).toContain('Please reset password')
    })
    it.only('returns 502 Bad Gateway when sending email fails', async () => {
      await createUser()
      simulateSmtpFailure = true
      const res = await forgotPassword()

      expect(res.status).toBe(502)
    })
  })
})
