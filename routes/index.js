module.exports = [
  require('./static'),
  require('./smoke'),
  require('./auth/login/post'),
  require('./auth/login/get'),
  require('./auth/logout'),
  require('./auth/register/get'),
  require('./auth/register/post'),
  require('./auth/status'),
  require('./auth/confirm'),
  require('./auth/resend'),
  require('./auth/recover'),
  require('./auth/reset'),
  require('./auth/email'),
  require('./auth/confirmChange'),
  require('./auth/password'),
  require('./home')
]
