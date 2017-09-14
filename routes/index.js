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
  require('./payment/stripe'),
  require('./payment/amazon'),
  require('./payment/ipn/paypal'),
  require('./payment/ipn/bitpay'),
  require('./payment/ipn/stripe'),
  require('./app/versions'),
  require('./pricing/plans'),
  require('./monitoring/hello'),
  require('./vpn/certificate'),
  require('./location/world'),
  require('./location/list'),
  require('./auth/teaserShare'),
  require('./home')
];
