const PayPal = require('paypal-nvp-api');
const config = require('../../configs/paypal');
const request = require('request-promise');

const server = require('../../server');

const ipnServer = {
  'live': 'ipnpb.paypal.com',
  'sandbox': 'ipnpb.sandbox.paypal.com'
}[config.mode];

const paypal = PayPal(config);

function numberedExtraVariables(prefix, vars) {
  var result = {};
  if (!Array.isArray(vars)) {
    vars = Object.keys(vars).filter(k => vars[k] !== undefined).map(k => encodeURIComponent(k) + '=' + encodeURIComponent(vars[k]));
  }
  vars = vars.filter(k => k !== undefined);
  for (var i = 0; i < vars.length; i++) {
    result[prefix + (i + 1)] = vars[i];
  }
  return result;
}

module.exports = {

  // Creates an encrypted button for a subscription with the requested properties, resolving to
  // an object with the required code to send the user to a PayPal checkout for the subscription.
  //
  // Returns: {
  //   code: raw html code for a button form (shouldn't be used directly)
  //   action: the URL for the <form action> attribute
  //   encrypted: the encrypted descriptor to go in a <input type="hidden" name="encrypted"> tag
  // }
  //
  // https://developer.paypal.com/docs/classic/api/button-manager/BMCreateButton_API_Operation_NVP/
  //
  createSubscriptionButton({
    plan,          // Plan code (any alphanumeric identifier, e.g. 'monthly1195')
    name,          // Displayed name of plan (e.g. "Cypherpunk Privacy Monthly Plan")
    price,         // Price in USD (either a number or a string, e.g. '11.95')
    period,        // Subscription interval as a number and unit ('1M', '6M' or '1Y')
    delay = 0,     // Number of days until the start of the subscription period (due to limitations in PayPal's API, for long delays the actual delay might be shorter)
    initial = 0,   // With a non-zero delay, specifies an initial amount charged immediately (e.g. for adjustments), implemented by making the trial period paid
    custom = null, // A piece of custom data to associate with the subscription
    returnURL = null, // URL to redirect the user back to after a successful purchase
    cancelURL = null, // URL to redirect the user back to after a canceled purchase
  }) {
    let delayParameters = {}, periodUnit;
    return Promise.resolve().then(() => {
      // Wrap conversions inside a promise so we get a rejection instead of naked exceptions
      if (typeof price === 'number') { price = price.toFixed(2); }
      if (typeof delay === 'string') { delay = Number.parseInt(delay); }
      if (typeof initial === 'number') { initial = initial.toFixed(2); }
      [ period, periodUnit = 'M' ] = (period + '').match(/^(\d+)([DMY])?$/).slice(1);
      // PayPal only supports delays of up to 90 days, for longer delays we must use 0-52 number of weeks instead...
      if (delay > 90) { delayParameters = { a1: '0', p1: Math.floor(delay / 7).toFixed(), t1: 'W' }; }
      else if (delay > 0) { delayParameters = { a1: '0', p1: delay.toFixed(), t1: 'D' }; }
    })
    .then(() => pp.request('BMCreateButton', Object.assign({
      BUTTONCODE: 'ENCRYPTED',
      BUTTONTYPE: 'SUBSCRIBE',
      BUTTONSUBTYPE: 'SERVICES',
      BUTTONCOUNTRY: 'US',
    }, numberedExtraVariables('L_BUTTONVAR', { // https://developer.paypal.com/docs/classic/paypal-payments-standard/integration-guide/Appx_websitestandard_htmlvariables/
      bn: 'CypherpunkPrivacy_Subscribe_' + plan + '_US',
      item_name: name,
      item_number: plan,
      business: config.email,
      currency_code: 'USD',
      src: '1',
      //srt: '12',
      sra: '1',
      no_note: '1',
      no_shipping: '1',
      custom: custom ? JSON.stringify(custom) : undefined,
      //modify: '1',
      notify_url: server.info.uri + '/api/v1/paypal/ipn',
      cancel_return: cancelURL || undefined,
      return: returnURL || undefined,
      a3: price,
      p3: period,
      t3: periodUnit,
    }, delayParameters))))
    .then(result => {
      if (result.ACK === 'Success') {
        let m = result.WEBSITECODE.match(/^<form action="([^"]*)" method="post">\n<input type="hidden" name="cmd" value="_s-xclick">\n<input type="hidden" name="encrypted" value="([^"]*)"/);
        if (m && m[1] && m[2]) {
          return { code: result.WEBSITECODE, action: m[1], encrypted: m[2] };
        }
      }
      throw new Error("Invalid PayPal button");
    });
  },

  // Cancels a subscription with the given PayPal ID.
  //
  cancelSubscription() {

  },

  // Validates an IPN by passing the notification back to PayPal's servers, resolves
  // to the string 'VERIFIED' if successful or rejects with an Error otherwise.
  //
  validateIPN(ipn_body) {
    if (ipn_body instanceof Buffer) { ipn_body = ipn_body.toString('utf8'); }
    if (typeof ipn_body !== 'string') { return Promise.reject(new Error("Bad IPN body")); }
    return request({
      method: 'POST',
      uri: `https://${ipnServer}/cgi-bin/webscr`,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'cmd=_notify-validate&' + ipn_body
    }).then(body => {
      if (config.mode === 'sandbox' && body.indexOf('Fatal Failure') > 0) { body = 'VERIFIED'; } // stupid paypal sandbox randomly fails; treat as success
      if (body !== 'VERIFIED') throw new Error(`Invalid IPN [${body}]: ${ipn_body}`);
      return body;
    });
  }
};
