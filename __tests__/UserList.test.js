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

describe('Get all users', () => {
  describe('Get /api/v1/users/', () => {
    it('returns 403 if unathorised', async () => {
      await createUser()
      await createUser(validUser2)
      const user = await loginUser(validUser2)
      const userCookies = user.headers['set-cookie']

      const res = await request(app).get('/api/v1/users').set('cookie', userCookies)

      expect(res.status).toBe(403)
    })
    it('returns 200 when valid auth and role admin', async () => {
      await createUser()
      const admin = await loginUser()
      const adminCookies = admin.headers['set-cookie']
      await createUser(validUser2)

      const res = await request(app).get('/api/v1/users').set('cookie', adminCookies)

      expect(res.status).toBe(200)
    })
    it('returns 200 when valid auth and role admin', async () => {
      await createUser()
      const admin = await loginUser()
      const adminCookies = admin.headers['set-cookie']
      await createUser(validUser2)

      const res = await request(app).get('/api/v1/users').set('cookie', adminCookies)

      expect(res.status).toBe(200)
    })
    it('returns users list when valid auth and role admin', async () => {
      await createUser()
      const admin = await loginUser()
      const adminCookies = admin.headers['set-cookie']
      await createUser(validUser2)

      const res = await request(app).get('/api/v1/users').set('cookie', adminCookies)

      expect(res.status).toBe(200)
      expect(res.body.users.length).toEqual(2)
      expect(res.body.users[0].name).toBe('Delvoid')
    })
  })
})

describe('get user by id', () => {
  describe('Get /api/v1/users/:id', () => {
    it('returns 404 when user is not found', async () => {
      await createUser()
      const admin = await loginUser()
      const adminCookies = admin.headers['set-cookie']

      const id = new ObjectId().toString()
      const res = await request(app).get(`/api/v1/users/${id}`).set('cookie', adminCookies)

      expect(res.status).toBe(404)
    })
    it('returns correct error body when user not found', async () => {
      await createUser()
      const admin = await loginUser()
      const adminCookies = admin.headers['set-cookie']

      const id = new ObjectId().toString()
      const res = await request(app).get(`/api/v1/users/${id}`).set('cookie', adminCookies)

      expect(Object.keys(res.body)).toEqual(['path', 'timestamp', 'statusCode', 'msg'])
    })
    it('returns 200 on valid user', async () => {
      await createUser()
      const admin = await loginUser()
      const adminCookies = admin.headers['set-cookie']

      await createUser(validUser2)
      const user2 = await UserModel.findOne({ name: validUser2.name })

      const res = await request(app).get(`/api/v1/users/`).set('cookie', adminCookies)
      const res2 = await request(app).get(`/api/v1/users/${user2._id}`).set('cookie', adminCookies)

      expect(res.status).toBe(200)
      expect(res2.status).toBe(200)
    })
    it('returns 401 when basic user tries to get another user', async () => {
      await createUser()
      const admin = await loginUser()
      const adminUser = await UserModel.findOne({ name: validUser.name })

      await createUser(validUser2)
      const userHead = await loginUser(validUser2)
      const userCookies = userHead.headers['set-cookie']
      const user = await UserModel.findOne({ name: validUser2.name })

      const res = await request(app).get(`/api/v1/users/${user._id}`).set('cookie', userCookies)
      const res2 = await request(app)
        .get(`/api/v1/users/${adminUser._id}`)
        .set('cookie', userCookies)
      expect(res.status).toBe(200)
      expect(res2.status).toBe(403)
    })
  })
})
