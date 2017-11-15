const configs = require('../../../configs');
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
    // stripe webhook body
    let payload = request.pre.payload;

    let stripeCustomerId, stripeSubscriptionId;
    if (payload.data && payload.data.object) {
      stripeCustomerId = payload.data.object.customer;
      stripeSubscriptionId = payload.data.object.subscription;
    }
    let user, subscription;

    console.log("IPN", payload.type);

    let promise = Promise.all([
      stripeCustomerId && request.db('stripe_customers').where({ stripe_id: stripeCustomerId }).join('users', 'stripe_customers.user_id', 'users.id').first(),
      stripeSubscriptionId && request.db('stripe_subscriptions').where({ stripe_id: stripeSubscriptionId }).join('subscriptions', 'stripe_subscriptions.subscription_id', 'subscriptions.id').first(),
    ])
    .then(arr => { [ user, subscription] = arr; })
    .then(() =>{
      //console.log("IPN", payload);
      //console.log("user", user, "subscription", subscription);
      switch (payload.type) {
        case 'invoice.payment_succeeded':
          console.log(payload.data.object);
          return request.subscriptions.recordSuccessfulPayment({
            subscription_id: subscription.id,
            provider: 'stripe',
            transaction_id: payload.data.object.charge || payload.data.object.invoice || payload.id,
            user_id: user.id,
            plan_id: subscription.plan_id,
            currency: (payload.data.object.currency || 'USD').toUpperCase(),
            amount: (payload.data.object.total / 100).toFixed(2),
            date: new Date(payload.data.object.period_start * 1000),
            data: payload,
          });
      }
    })
    .catch(err => { console.error(err); throw err; });

    reply(promise);

    /*
    switch (payload.type) {
      case 'invoice.payment_succeeded':
        //recordSuccessfulPayment({ subscription_id, provider, transaction_id, user_id, plan_id, currency = 'USD', amount, date = new Date(), data }) {
        request.subscriptions.recordSuccessfulPayment({
          subscription_id: ...,
          provider: 'stripe',
          transaction_id,
        })

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
    */
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
  let returnValue;
  let promise = Promise.resolve()
  .then(() => JSON.parse(payload))
  .then(json => {
    if (!json.livemode) {
      if (configs.env === 'DEV') return json;
      throw new Error("Received test stripe notification on live server");
    }
    return request.stripe.verify_webhook(payload, stripeHeaderSig).then(() => json);
  })
  .catch((e) => { return Boom.badRequest(e.message); });
  return reply(promise);
}
