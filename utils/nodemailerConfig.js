const test = {
  host: 'localhost',
  port: Math.floor(Math.random() * 2000) + 10000,
  tls: {
    rejectUnauthorized: false,
  },
}

const dev = {
  host: 'smtp.ethereal.email',
  port: 587,
  auth: {
    user: 'einar.hagenes99@ethereal.email',
    pass: '8AQXjjKNMMt8gHHCDq',
  },
  tld: {
    rejectUnauthorized: false,
  },
}

module.exports = process.env.NODE_ENV === 'test' ? test : dev
