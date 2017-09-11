const Boom = require('boom');

module.exports = {
  method: 'POST',
  path: '/api/v1/ipn/stripe',
  config: {
    auth: false,
    payload: { parse: false },
    pre: [ { method: validateWebhook, assign: 'payload' } ]
  },
  handler: (request, reply) => {
    // return 200 to stripe so they stop calling this route
    reply();

    // stripe webhook body
    let payload = request.pre.payload;

    // stripe customer id
    // let customerId = payload.data.object.customer;
    let customerId = 'cus_BNYFDYJUWZWbc7';
    if (!customerId) { return console.log('Customer Id Not Found'); }

    // find user by stripe customer id
    let user;
    request.db('stripe')
    .join('subscriptions', 'stripe.id', 'subscriptions.provider_id')
    .join('users', 'subscriptions.user_id', 'users.id')
    .where({ 'stripe.customer_id': customerId })
    .select('users.id', 'users.email', 'users.type')
    // validate user is found
    .then((data) => {
      if (data.length) { user = data[0]; }
      else { throw new Error('Cypherpunk Account Not Found, Stripe CustomerId: ', customerId); }
    })
    // switch on webhook event type
    .then(() => {
      switch (payload.type) {
        case 'charge.succeeded':
          onChargeSucceeded(request, payload, user);
          break;
        default:
          sendSlackNotification(request.slack, payload);
          console.log(`Unknown Stripe IPN type: ${payload.type}`);
      }
    });
  }
};

function sendSlackNotification(slack, data, user) {
  console.log(data);
  let msg = "[*Stripe*] ";

  switch (data.type) {
    case 'charge.succeeded':
      msg += `[*PAYMENT*] $${data.data.object.amount} :moneybag:`;
      break;
    default:
      msg += `[*${data.type.toUpperCase()}*]`;
  }

  // indent slack style
  msg += '\r>>>\r';

  // if present, append cypherpunk account email
  if (user && user.email) {
    msg += `\rCypherpunk account: ${user.email} (${user.type})`;
  }

	// send to slack
	slack.billing(msg);
}

function onChargeSucceeded(request, payload, user) {
  // ensure stripe data object is attached
  let chargeData = payload.data.object;
  if (!chargeData) { return console.log('Stripe Data Object incomplete'); }

  let created = chargeData.created || payload.created || Math.floor((new Date()).getTime() / 1000);
  chargeData.created = new Date(created * 1000);
  chargeData.cypherpunk_account_id = user.id;
  chargeData.sourceID = chargeData.source.id;
  chargeData.sourceBrand = chargeData.source.brand;
  chargeData.sourceLast4 = chargeData.source.last4;
  chargeData.sourceExpMonth = chargeData.source.exp_month;
  chargeData.sourceExpYear = chargeData.source.exp_year;

  // TODO: create charge

  // TODO: create charge receipt

  sendSlackNotification(request.slack, payload, user);
}

function validateWebhook(request, reply) {
  let payload = request.payload.toString('utf8');
  let stripeHeaderSig = request.headers['stripe-signature'];
  let promise = request.stripe.verify_webhook(payload, stripeHeaderSig)
  .then(() => { return JSON.parse(payload); })
  .catch((e) => { return Boom.badRequest(e.message); });
  return reply(promise);
}
