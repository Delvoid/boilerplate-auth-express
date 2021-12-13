const test = {
  host: 'localhost',
  port: Math.floor(Math.random() * 2000) + 10000,
  tls: {
    rejectUnauthorized: false,
  },
}

const dev = {
  service: 'gmail',
  auth: {
    user: process.env.PROD_EMAIL,
    pass: process.env.PROD_EMAIL_PASS,
  },
  tld: {
    rejectUnauthorized: false,
  },
}

module.exports = process.env.NODE_ENV === 'test' ? test : dev
