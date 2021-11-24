const request = require('supertest')
const SMTPServer = require('smtp-server').SMTPServer
const app = require('../app')
const connectDb = require('../db/connect')
const UserModel = require('../models/User')
const nodemailerConfig = require('../utils/nodemailerConfig')
const bcrypt = require('bcryptjs')

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

const updatePassword = async (password = passwords) => {
  await createUser()
  const userCookie = await loginUser()
  const cookies = userCookie.headers['set-cookie']
  const agent = await request(app)
    .patch('/api/v1/users/updateUserPassword')
    .set('cookie', cookies)
    .send({
      oldPassword: password.oldPassword,
      newPassword: password.newPassword,
    })
  return agent
}
const updateUser = async (data = updateData) => {
  await createUser()
  const userCookie = await loginUser()
  const cookies = userCookie.headers['set-cookie']
  const agent = await request(app).patch('/api/v1/users/updateUser').set('cookie', cookies).send({
    name: data.name,
    email: data.email,
  })
  return agent
}

const validUser = {
  name: 'Delvoid',
  email: 'delvoid.dev@gmail.com',
  password: 'Test321.',
}
const passwords = {
  oldPassword: validUser.password,
  newPassword: 'Delvoid312.',
}
const updateData = {
  name: 'Void',
  email: 'updated@gmail.com',
}
describe('Update user password', () => {
  describe('PATCH /api/v1/users/updateUserPassword', () => {
    it('returns 200 with msg on valid request', async () => {
      const res = await updatePassword()
      expect(res.status).toBe(200)
    })

    it('returns 400 if oldPassword is missing', async () => {
      const res = await updatePassword({ ...passwords, oldPassword: '' })
      expect(res.status).toBe(400)
    })

    it('returns 400 if newPassword is missing', async () => {
      const res = await updatePassword({ ...passwords, newPassword: '' })
      expect(res.status).toBe(400)
    })
    it('returns 401 if passwords do not match', async () => {
      const res = await updatePassword({ ...passwords, oldPassword: 'notcorrect' })
      expect(res.status).toBe(401)
    })
    it('returns 400 if password is not pass validation', async () => {
      const res = await updatePassword({ ...passwords, newPassword: 'notvalid' })
      expect(res.status).toBe(400)
    })
    it('updates the password in database when the request is valid', async () => {
      const res = await updatePassword()

      const user = await UserModel.findOne({})
      const isMatch = await bcrypt.compare(passwords.newPassword, user.password)

      expect(isMatch).toBeTruthy()
    })
  })
  describe('Update user details', () => {
    describe('PATCH /api/v1/users/updateUser', () => {
      it('returns 401 when request without basic auth', async () => {
        const res = await request(app).patch('/api/v1/users/updateUser')
        expect(res.status).toBe(401)
      })
      it('returns 200 with msg on valid request', async () => {
        const res = await updateUser()
        const user = await UserModel.findOne({})

        expect(res.status).toBe(200)
        expect(user.name).toBe(updateData.name)
        expect(user.email).toBe(updateData.email)
      })
      it('returns 400 if name is missing', async () => {
        const res = await updateUser({ ...updateUser, name: '' })
        expect(res.status).toBe(400)
      })
      it('returns 400 if email is missing', async () => {
        const res = await updateUser({ ...updateUser, email: '' })
        expect(res.status).toBe(400)
      })
    })
  })
})
