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
  await dbConnection.close()
  await server.close()
  jest.setTimeout(5000)
})
beforeEach(async () => {
  await dbConnection.collection('users').deleteMany({})
})

const registerUser = (user = validUser) => {
  const agent = request(app).post('/api/v1/auth/register')
  return agent.send(user)
}
const validUser = {
  name: 'Delvoid',
  email: 'delvoid.dev@gmail.com',
  password: 'Test321.',
}

describe('User Registration', () => {
  describe('POST /api/v1/auth/register', () => {
    it('returns 200 on valid request', async () => {
      const res = await registerUser()
      expect(res.status).toBe(201)
    })

    it('returns success messsage when signup request is valid', async () => {
      const res = await registerUser()
      expect(res.body.msg).toBe('Success! Please check your email to verify account')
    })

    it('returns error when same email is already in use', async () => {
      await registerUser()
      const res = await registerUser()

      expect(res.status).toBe(400)
      expect(res.body.msg).toBe('Email already exists')
    })

    it('saves the user to database', async () => {
      await registerUser()
      const users = await UserModel.find({})
      expect(users.length).toBe(1)
      expect(users[0].name).toBe('Delvoid')
      expect(users[0].email).toBe('delvoid.dev@gmail.com')
    })

    it('hashes the password in database', async () => {
      await registerUser()
      const users = await UserModel.find({})
      const user = users[0]
      expect(user.password).not.toBe('Test321.')
    })
    it('creates user with unverfied email', async () => {
      await registerUser()
      const users = await UserModel.find({})
      const savedUser = users[0]
      expect(savedUser.isVerified).toBe(false)
    })
    it('saves a email verification token', async () => {
      await registerUser()
      const users = await UserModel.find({})
      const savedUser = users[0]
      expect(savedUser.verificationToken).toEqual(expect.any(String))
    })
    it('returns 400 when name is null', async () => {
      const res = await registerUser({
        name: null,
        email: 'delvoid.dev@gmail.com',
        password: 'Test123.',
      })
      expect(res.status).toBe(400)
    })
    it('returns 400 when email is null', async () => {
      const res = await registerUser({
        name: 'Delvoid',
        email: '',
        password: 'Test123.',
      })
      expect(res.status).toBe(400)
    })
    it('returns 400 when password is null', async () => {
      const res = await registerUser({
        name: 'Delvoid',
        email: 'delvoid.dev@gmail.com',
        password: '',
      })
      expect(res.status).toBe(400)
    })
    it('returns validationErrors field in response body when validation error occurs', async () => {
      const res = await registerUser({
        name: null,
        email: 'delvoid.dev@gmail.com',
        password: 'Test123.',
      })
      const body = res.body
      expect(body.validationErrors).not.toBeUndefined()
    })

    it('returns errors when name email and password null', async () => {
      const res = await registerUser({
        username: null,
        email: null,
        password: null,
      })
      const body = res.body
      expect(Object.keys(body.validationErrors)).toEqual(['name', 'email', 'password'])
    })

    it.each`
      field         | value              | expectedMessage
      ${'name'}     | ${null}            | ${'Please provide name'}
      ${'name'}     | ${'us'}            | ${'Minimun username length is 2 characters'}
      ${'name'}     | ${'a'.repeat(55)}  | ${'Maximun username length is 50 characters'}
      ${'email'}    | ${null}            | ${'Please provide email'}
      ${'email'}    | ${'mail.com'}      | ${'Please provide valid email'}
      ${'email'}    | ${'user.mail.com'} | ${'Please provide valid email'}
      ${'email'}    | ${'user@com'}      | ${'Please provide valid email'}
      ${'password'} | ${null}            | ${'Password must have at least 1 uppercase, 1 lowercase letter and 1 number'}
      ${'password'} | ${'p4ssw'}         | ${'Minimun password length is 8 characters'}
      ${'password'} | ${'alllowercase'}  | ${'Password must have at least 1 uppercase, 1 lowercase letter and 1 number'}
      ${'password'} | ${'ALLUPPERCASE'}  | ${'Password must have at least 1 uppercase, 1 lowercase letter and 1 number'}
      ${'password'} | ${'123456789'}     | ${'Password must have at least 1 uppercase, 1 lowercase letter and 1 number'}
      ${'password'} | ${'lowerAndUpper'} | ${'Password must have at least 1 uppercase, 1 lowercase letter and 1 number'}
      ${'password'} | ${'lower4nd5667'}  | ${'Password must have at least 1 uppercase, 1 lowercase letter and 1 number'}
      ${'password'} | ${'UPPER4ND5667'}  | ${'Password must have at least 1 uppercase, 1 lowercase letter and 1 number'}
    `(
      'returns $expectedMessage when $field is $value',
      async ({ field, expectedMessage, value }) => {
        const user = {
          name: 'Delvoid',
          email: 'delvoid.dev@gmail.com',
          password: 'Test123.',
        }
        user[field] = value
        const res = await registerUser(user)
        const body = res.body
        expect(body.validationErrors[field]).toBe(expectedMessage)
      }
    )

    it('sends a account activation email with activationToken', async () => {
      await registerUser()
      const users = await UserModel.find({})
      const savedUser = users[0]

      expect(lastMail).toContain(savedUser.email)
      expect(lastMail).toContain('token')
    })
    it('returns 502 Bad Gateway when sending email fails', async () => {
      simulateSmtpFailure = true

      const response = await registerUser()
      expect(response.status).toBe(502)
    })
    it('returns Email failure message when sending email fails', async () => {
      simulateSmtpFailure = true

      const response = await registerUser()
      expect(response.body.msg).toBe('Invalid mailbox')
    })
    it('it does not save users to database if activation email fails', async () => {
      simulateSmtpFailure = true

      await registerUser()
      const users = await UserModel.find({})
      expect(users.length).toBe(0)
    })
  })
})
