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
    let customerId = payload.data.object.customer;
    // let customerId = 'cus_BT9zhxdhm0oZrH';
    if (!customerId) { return console.log('Customer Id Not Found'); }

    // find user by stripe customer id
    let user;
    request.db('stripe')
    .join('subscriptions', 'stripe.id', 'subscriptions.provider_id')
    .join('users', 'subscriptions.user_id', 'users.id')
    .where({ 'stripe.customer_id': customerId })
    .select('users.id', 'users.email', 'users.type', 'subscriptions.type', 'subscriptions.id as sub_id')
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
    })
    .catch(console.log);
  }
};

function sendSlackNotification(slack, data, user) {
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

  // get plan based on request.payload.plan
  let planType = request.plans.getPricingPlanType(user.type);
  if (!planType) { return console.log('Invalid Plan'); }
  console.log('PlanType: ', planType);

  // get stripePlan based on request.payload.plan
  let planId = request.plans.defaultPlanId[user.type];
  if (!planId) { return console.log('Invalid Plan'); }
  console.log('PlanId: ', planId);

  let plan = request.plans.getPlanByTypeAndID(planType, planId);
  if (!plan || !plan.price) { return console.log('Invalid Plan'); }
  payload.data.object.amount = plan.price;
  console.log('Plan: ', plan);

  // create charge
  request.db.insert({
    gateway: 'stripe',
    transaction_id: payload.data.object.id,
    user_id: user.id,
    subscription_id: user.sub_id,
    plan_id: planId,
    currency: 'USD',
    amount: plan.price,
    data: payload
  }).into('charges').returning('*')
  .catch((e) => { console.log(e); });

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
