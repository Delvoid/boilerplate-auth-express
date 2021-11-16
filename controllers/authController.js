const register = (req, res) => {
  res.send('register route')
}

const login = (req, res) => {
  res.send('login route')
}

const logout = (req, res) => {
  res.send('logout route')
}

module.exports = {
  register,
  login,
  logout,
}
