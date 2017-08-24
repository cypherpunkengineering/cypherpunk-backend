module.exports = [
  require('./static'),
  require('./smoke'),
  require('./auth/login/post'),
  require('./auth/login/get'),
  require('./auth/logout'),
  require('./auth/secret'),
  require('./auth/register/get'),
  require('./auth/register/post')
]
