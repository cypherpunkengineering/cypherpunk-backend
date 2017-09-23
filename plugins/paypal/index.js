const PayPal = require('paypal-nvp-api');
const config = require('../../configs/paypal');
const request = require('request-promise');

const ipnServer = {
  'live': 'ipnpb.paypal.com',
  'sandbox': 'ipnpb.sandbox.paypal.com'
};

const paypal = new PayPal(config);

module.exports = {
  createSubscriptionButton({

  }) {

  },

  // Validates an IPN by passing the notification back to PayPal's servers, resolves
  // to the string 'VERIFIED' if successful or rejects with an Error otherwise.
  validateIPN(ipn_body) {
    if (ipn_body instanceof Buffer) { ipn_body = ipn_body.toString('utf8'); }
    if (typeof ipn_body !== 'string') { return Promise.reject(new Error("Bad IPN body")); }
    return request({
      method: 'POST',
      uri: `https://${ipnServer[config.mode]}/cgi-bin/webscr`,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'cmd=_notify-validate&' + ipn_body
    }).then(body => {
      if (config.mode === 'sandbox' && body.indexOf('Fatal Failure') > 0) { body = 'VERIFIED'; } // stupid paypal sandbox randomly fails; treat as success
      if (body !== 'VERIFIED') throw new Error(`Invalid IPN [${body}]: ${ipn_body}`);
      return body;
    });
  }
};
