const request = require('supertest')
const app = require('../app')
const connectDb = require('../db/connect')
const UserModel = require('../models/User')

let dbConnection
beforeAll(async () => {
  dbConnection = await connectDb()
})

afterAll(async () => {
  await dbConnection.collection('users').deleteMany({})
  await dbConnection.close()
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

describe('Error Model', () => {
  it('returns path, timestamp, message and validationErrors in response when validation failure', async () => {
    const response = await registerUser({ ...validUser, name: null })
    const body = response.body
    expect(Object.keys(body)).toEqual([
      'path',
      'timestamp',
      'statusCode',
      'msg',
      'validationErrors',
    ])
  })
  it('returns path, timestamp and message in response when request fails other than validation error', async () => {
    const response = await request(app).post('/api/v1/auth/verify-email/').send()
    const body = response.body
    expect(Object.keys(body)).toEqual(['path', 'timestamp', 'statusCode', 'msg'])
  })
  it('returns path in error body', async () => {
    const response = await request(app).post('/api/v1/auth/verify-email/').send()
    const body = response.body
    expect(body.path).toEqual('/api/v1/auth/verify-email/')
  })
  it('returns timestamp in milliseconds within 5 seconds value in error body', async () => {
    const nowInMillis = new Date().getTime()
    const fiveSecondsLater = nowInMillis + 5 * 1000

    const response = await request(app).post('/api/v1/auth/verify-email/').send()
    const body = response.body
    expect(body.timestamp).toBeGreaterThan(nowInMillis)
    expect(body.timestamp).toBeLessThan(fiveSecondsLater)
  })
})
