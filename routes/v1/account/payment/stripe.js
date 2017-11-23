const Joi = require('joi');
const Boom = require('boom');

/**
 * Creates a payment request the caller can use to authorize a new PayPal
 * subscription, upon the completion of which the system will treat as
 * the new active subscription (canceling any other existing ones).
 *
 * Returns a JSON object with the following fields: {
 *   code: raw html code for a button form (deprecated; shouldn't be used directly)
 *   action: the URL for the <form action> attribute (https://...)
 *   encrypted: the encrypted subscription descriptor to feed to PayPal
 * }
 *
 * The caller should then submit a web form to PayPal (basically a checkout
 * button), which will redirect the user to paypal.com to authorize the
 * new subscription. Notifications for said subscription will be posted
 * to our backend, which will actually make the DB changes and switch over
 * the active subscription.
 */
module.exports = [{
  method: 'POST',
  path: '/api/v1/account/payment/stripe',
  options: {
    auth: { strategy: 'session', mode: 'required' },
    validate: {
      payload: {
        planId: Joi.string().required(),
        referralCode: Joi.string().optional(),
        token: Joi.string().required(),
        site: Joi.string().optional()
      }
    },
    pre: [
      { method: getUser, assign: 'user' },
      { method: getPlan, assign: 'plan' },
      { method: getTrial, assign: 'trial' },
      { method: getStripeCustomer, assign: 'customer' }
    ]
  },
  handler: async (request, h) => {
    let userId = request.auth.credentials.id;
    let stripeCustomer = request.pre.customer;
    let now = new Date();

    console.log('creating stripe object for', request.pre.user, request.pre.plan, request.pre.trial, request.pre.customer);

    try {
      // create new Stripe Customer
      if (stripeCustomer) {
        // existing customer
        if (request.payload.token !== stripeCustomer.token) {
          // update existing customer with new source
          let customer = await request.stripe.api.customers.update(stripeCustomer.stripe_id, { source: request.payload.token });
          await request.db('stripe_customers').where({ user_id: userId }).update(stripeCustomer = parseStripeCustomerData(customer));
        }
      }
      else {
        // create new customer with new source
        let newCustomer = {
          email: request.pre.user.email,
          source: request.payload.token,
          metadata: { user_id: userId }
        };
        let customer = await request.stripe.api.customers.create(newCustomer);
        await request.db('stripe_customers').insert(Object.assign({ user_id: userId }, stripeCustomer = parseStripeCustomerData(customer)));
      }


      // create a new stripe subscription
      let newSubscription = {
        customer: stripeCustomer.stripe_id,
        items: [ { plan: request.payload.planId } ],
        trial_period_days: request.pre.trial.days
      };
      let stripeSubscription = await request.stripe.api.subscriptions.create(newSubscription);

      // create new subscription record
      let subscriptionRecord = {
        user_id: userId,
        type: request.pre.plan.type,
        plan_id: request.pre.plan.id,
        provider: 'stripe',
        date: request.pre.trial.end || now,
        firstPaymentIncluded: false
      };
      let subscription = await request.subscriptions.recordSubscription(subscriptionRecord);

      // create new stripe subscription record in db
      await request.db('stripe_subscriptions').insert({
        subscription_id: subscription.id,
        stripe_id: stripeSubscription.id,
        stripe_data: stripeSubscription
      });

      return h.response().code(200);
    }
    catch (err) { return Boom.badImplementation(err); }
  }
},
{
  method: 'GET',
  path: '/api/v1/account/payment/stripe/cards',
  options: { auth: { strategy: 'session', mode: 'required' } },
  handler: async (request, h) => {
    let userId = request.auth.credentials.id;
    let columns = [ 'token', 'last4', 'exp_month', 'exp_year', 'brand' ];
    try {
      let cards = await request.db.select(columns).from('stripe_customers')
        .where({ user_id: userId });
      return cards;
    }
    catch (err) { return Boom.badRequest('Error while fetching cards'); }
  }
}
/*,
{
  method: 'POST',
  path: '/api/v1/account/payment/stripe/cards',
  config: {
    auth: { strategy: 'session', mode: 'required' },
    validate: {
      payload: {
        token: Joi.string().required(),
      }
    },
  },
  handler(request, h) {
    let userId = request.auth.credentials.id;
    request.stripe.api.sources.retrieve(request.payload.token)
    .then()
  }
},
{
  method: 'DELETE',
  path: '/api/v1/account/payment/stripe/cards',
  config: {
    auth: { strategy: 'session', mode: 'required' },
    validate: {
      payload: {
        token: Joi.string().optional(), // delete one token if present, or all tokens otherwise
      }
    },
  },
  handler(request, h) {
    let userId = request.auth.credentials.id;
    let promise;
    if (request.payload.token) {
      promise = request.db('stripe_sources').where({ user_id: userId, token: request.payload.token }).delete()
      .then(() => {}, err => Boom.badImplementation("Error while deleting card"));
    } else {
      promise = request.db('stripe_sources').where({ user_id: userId }).delete()
      .then(() => {}, err => Boom.badImplementation("Error while deleting cards"));
    }
    h(promise);
  }
}*/];

async function getUser (request, h) {
  return request.db.select('*').from('users').where({ id: request.auth.credentials.id }).first();
}

async function getPlan (request, h) {
  let plan = request.plans.getPlanByID(request.payload.planId);
  return plan || Boom.badRequest('Invalid plan');
}

async function getTrial (request, h) {
  try {
    let row = await request.db.select('current_period_end_timestamp').from('subscriptions')
      .where({ user_id: request.auth.credentials.id, current: true }).first();
    return { end: row.current_period_end_timestamp, days: Math.max(0, Math.floor((row.current_period_end_timestamp - +new Date()) / 86400000)) };
  }
  catch (err) { return { end: undefined, days: 0 }; }
}

async function getStripeCustomer (request, h) {
  try {
    let result = await request.db.select('*').from('stripe_customers')
      .where({ user_id: request.auth.credentials.id }).first();
    return result;
  }
  catch (err) { return null; }
}

function parseStripeCustomerData (data) {
  if (!data.sources || data.sources.object !== 'list' || data.sources.total_length === 0 || (!data.default_source && data.sources.total_length > 1)) {
    throw new Error('Unable to parse sources');
  }
  let defaultSource = data.default_source || data.sources.data[0].id;
  let result = { stripe_id: data.id };
  for (let source of data.sources.data) {
    if (source.id === defaultSource && source.object === 'card') {
      result.token = source.id;
      result.last4 = source.last4;
      result.exp_month = source.exp_month;
      result.exp_year = source.exp_year;
      result.brand = source.brand;
      return result;
    }
  }
  throw new Error('Unable to identify source');
}
