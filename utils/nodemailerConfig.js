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
    user: process.env.ETHEREAL_EMAIL,
    pass: process.env.ETHEREAL_PASS,
  },
  tld: {
    rejectUnauthorized: false,
  },
}

module.exports = process.env.NODE_ENV === 'test' ? test : dev
