const paypal = require('..');

module.exports = {
  method: 'POST',
  path: '/api/v2/billing/paypal/ipn',
  config: { auth: false },
  handler: (request, reply) => {

  }
}