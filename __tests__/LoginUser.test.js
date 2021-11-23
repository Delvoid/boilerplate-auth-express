const request = require('supertest')
const SMTPServer = require('smtp-server').SMTPServer
const app = require('../app')
const connectDb = require('../db/connect')
const UserModel = require('../models/User')
const nodemailerConfig = require('../utils/nodemailerConfig')

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

const validUser = {
  name: 'Delvoid',
  email: 'delvoid.dev@gmail.com',
  password: 'Test321.',
}

describe('Login User', () => {
  describe('POST api/v1/auth/login', () => {
    it('returns 200 when credentials are correct', async () => {
      await createUser()
      const res = await loginUser()

      expect(res.status).toBe(200)
    })
    it('returns tokenUser: name, userId, role when login success', async () => {
      const user = await createUser()
      const res = await loginUser()

      expect(res.body.user.userId).toBe(user.id)
      expect(res.body.user.name).toBe(user.name)
      expect(Object.keys(res.body.user)).toEqual(['name', 'userId', 'role'])
    })

    it('attaches cookies if login is successful', async () => {
      await createUser()
      const res = await loginUser()

      expect(res.headers['set-cookie'][0]).toContain('accessToken')
      expect(res.headers['set-cookie'][1]).toContain('refreshToken')
    })
    it('returns 401 if user does not exist ', async () => {
      await createUser()
      const res = await loginUser({ ...validUser, email: 'fake@mail.com' })
      expect(res.status).toBe(401)
    })
    it('returns correct error body when auth fails ', async () => {
      const nowInMillis = new Date().getTime()
      await createUser()
      const res = await loginUser({ ...validUser, email: 'fake@mail.com' })

      const error = res.body
      expect(error.path).toBe('/api/v1/auth/login')
      expect(error.timestamp).toBeGreaterThan(nowInMillis)
      expect(Object.keys(error)).toEqual(['path', 'timestamp', 'statusCode', 'msg'])
    })
    it('returns 401 when password does not match', async () => {
      await createUser()
      const res = await loginUser({ ...validUser, password: 'incorrectPass' })

      expect(res.status).toBe(401)
      expect(res.body.msg).toBe('Invalid credentials')
    })
    it('returns 401 when email is not valid', async () => {
      await createUser()
      const res = await loginUser({ ...validUser, email: 'invalidemail' })

      expect(res.status).toBe(401)
      expect(res.body.msg).toBe('Invalid credentials')
    })
    it('returns 401 when password is not valid', async () => {
      await createUser()
      const res = await loginUser({ ...validUser, password: 'invalidpass' })

      expect(res.status).toBe(401)
      expect(res.body.msg).toBe('Invalid credentials')
    })
    it('returns 401 when email is missing', async () => {
      await createUser()
      const res = await loginUser({ ...validUser, email: '' })

      expect(res.status).toBe(400)
      expect(res.body.msg).toBe('Please provide email and password')
    })
    it('returns 401 when password is missing', async () => {
      await createUser()
      const res = await loginUser({ ...validUser, password: '' })

      expect(res.status).toBe(400)
      expect(res.body.msg).toBe('Please provide email and password')
    })
    it('returns 403 when logging in with an unverified account', async () => {
      await registerUser()
      const res = await loginUser()

      expect(res.status).toBe(401)
      expect(res.body.msg).toBe('Please verify your email')
    })
  })
})
