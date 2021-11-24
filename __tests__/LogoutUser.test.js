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

const logout = async (cookies) => {
  const agent = request(app).delete('/api/v1/auth/logout').set('cookie', cookies)
  return await agent.send()
}

const validUser = {
  name: 'Delvoid',
  email: 'delvoid.dev@gmail.com',
  password: 'Test321.',
}

describe('Logout User', () => {
  describe('DELETE /api/v1/auth/logout', () => {
    it('returns 200 ok when unathorized user sends a logout request', async () => {
      const res = await request(app).delete('/api/v1/auth/logout')
      expect(res.status).toBe(401)
      expect(res.body.msg).toBe('Authentication Invalid')
    })
    it('removes tokens from database', async () => {
      await createUser()
      const res = await loginUser()
      const cookies = res.headers['set-cookie']

      const storedToken = await TokenModel.find({ where: { user: res.body.userId } })
      expect(storedToken.length).toBe(1)
      await logout(cookies)

      const deletenToken = await TokenModel.find({ where: { user: res.body.userId } })
      expect(deletenToken.length).toBe(0)
    })
    it('removes cookies', async () => {
      await createUser()
      const res = await loginUser()
      let cookies = res.headers['set-cookie']
      await request(app).get('/api/v1/dashboard').set('cookie', cookies)

      const logoutUser = await logout(cookies)
      cookies = logoutUser.headers['set-cookie']
      const unauth = await request(app).get('/api/v1/dashboard').set('cookie', cookies)

      expect(unauth.status).toBe(401)
    })
  })
})
