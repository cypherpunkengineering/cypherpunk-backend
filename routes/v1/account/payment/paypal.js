const Joi = require('joi');
const Boom = require('boom');

const planPeriods = {
  monthly: '1M',
  semiannually: '6M',
  annually: '1Y'
};

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
module.exports = {
  method: 'POST',
  path: '/api/v1/account/payment/paypal',
  options: {
    auth: { strategy: 'session', mode: 'required' },
    validate: {
      payload: {
        planId: Joi.string().required(),
        referralCode: Joi.string().optional(),
        site: Joi.string().optional()
      }
    },
    pre: [
      { method: getPlan, assign: 'plan' },
      { method: getDelay, assign: 'delay' }
    ]
  },
  handler: async (request, h) => {
    let userId = request.auth.credentials.id;

    let params = {
      plan: request.payload.planId,
      name: request.pre.plan.name,
      price: request.pre.plan.price,
      period: planPeriods[request.pre.plan.type],
      delay: request.pre.delay,
      initial: 0,
      custom: userId,
      returnURL: (request.payload.site || 'https://cypherpunk.com') + '/billing/complete/paypal',
      cancelURL: (request.payload.site || 'https://cypherpunk.com') + '/billing/cancel/paypal'
    };
    return request.paypal.createSubscriptionButton(params);
    // TODO: log created button?
  }
};

async function getPlan (request, h) {
  let plan = request.plans.getPlanByID(request.payload.planId);
  return plan || Boom.badRequest('Invalid plan');
}

async function getDelay (request, h) {
  try {
    let row = await request.db.select('current_period_end_timestamp').from('subscriptions')
      .where({ user_id: request.auth.credentials.id, current: true }).first();
    return Math.max(0, Math.floor((row.current_period_end_timestamp - +new Date()) / 86400000));
  }
  catch (err) { return 0; }
}
