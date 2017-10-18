function flatten(item, result) {
  if (!result) { result = []; }
  if (Array.isArray(item)) {
    item.forEach(i => flatten(i, result));
  } else {
    result.push(item);
  }
  return result;
}

module.exports = flatten([
  // admin routes
  require('./admin/users/counts/get'),
  require('./admin/users/index/get'),
  require('./admin/users/get'),
  require('./admin/communication/post'),
  require('./admin/users/reset/post'),
  require('./admin/search/get'),
  // v1 route
  require('./v1/account/logout'),
  require('./v1/account/status'),
  require('./v1/account/authenticate/userpasswd'),
  require('./v1/account/authenticate/password'),
  require('./v1/account/change/email'),
  require('./v1/account/change/password'),
  require('./v1/account/confirm/email'),
  require('./v1/account/confirm/emailChange'),
  require('./v1/account/confirm/resend'),
  require('./v1/account/identify/email'),
  require('./v1/account/payment/paypal'),
  require('./v1/account/payment/stripe'),
  require('./v1/account/purchase/amazon'),
  require('./v1/account/purchase/stripe'),
  require('./v1/account/recover/email'),
  require('./v1/account/recover/reset'),
  require('./v1/account/register/signup'),
  require('./v1/account/register/teaserShare'),
  require('./v1/app/versions'),
  require('./v1/ipn/bitpay'),
  require('./v1/ipn/paypal'),
  require('./v1/ipn/stripe'),
  require('./v1/location/list'),
  require('./v1/location/world'),
  require('./v1/monitoring/hello'),
  require('./v1/pricing/plans'),
  require('./v1/vpn/certificate'),
  require('./v1/emails/unsubscribe'),
  // static files
  require('./static'),
  require('./home'),
  require('./redirect'),
]);
