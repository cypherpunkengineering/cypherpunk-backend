module.exports = [
  require('./static'),
  require('./smoke'),
  require('./auth/login/post'),
  require('./auth/login/get'),
  require('./auth/logout'),
  require('./auth/register/get'),
  require('./auth/register/post'),
  require('./auth/status'),
  require('./home'),

  require('./api/v2/account/GET'),
  require('./api/v2/account/subscriptions/GET'),
  require('./api/v2/billing/paypal/ipn/POST'),

  require('./billing/GET'),
]
