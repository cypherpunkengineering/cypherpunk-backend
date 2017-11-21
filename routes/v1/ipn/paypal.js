const Boom = require('boom');
const qs = require('qs');

const handlers = {
  'subscr_signup': onSubscriptionSignup,
  'subscr_cancel': onSubscriptionCancel,
  'subscr_payment': onSubscriptionPayment
};

module.exports = {
  method: 'POST',
  path: '/api/v1/ipn/paypal',
  options: {
    auth: false,
    payload: { output: 'data', parse: false },
    pre: [ { method: validateIPN, assign: 'payload' } ]
  },
  handler: async (request, h) => {
    // Payload data actually validated and parsed in pre handler
    let data = request.pre.payload;

    let userId = data.custom;
    let plan = request.plans.getPlanByID(data.item_number);

    return request.db('users').where({ id: userId }).first()
      .then(user => {
        // use txn_type to switch on how to handle this message
        let handler = handlers[data.txn_type];
        if (handler) { return handler(request, user, plan, data); }
        else {
          sendSlackNotification(request.slack, data, user);
          if (data.txn_type !== 'subscr_eot') {
            throw Boom.badImplementation('Unknown PayPal IPN type');
          }
        }
      })
      // catch any raw errors so these
      .catch(err => Boom.badImplementation('IPN handling error', err))
      .then(result => {
        if (Boom.isBoom(result)) { return result; }
        else { return h.response().code(200); }
      });
  }
};

function sendSlackNotification (slack, data, user) {
  let msg = '[*PayPal*] ';

  switch (data.txn_type) {
    case 'subscr_signup':
      msg += '[*SUBSCRIPTION*] :grinning:';
      break;
    case 'subscr_payment':
      msg += '[*PAYMENT*] :moneybag:';
      break;
    case 'subscr_cancel':
      msg += '[*CANCEL*] :cry';
      break;
    default:
      msg += `[*${data.txn_type}*]`;
  }

  // indent slack style
  msg += '\r>>>\r';

  // append paypal payer email
  msg += `\rPayPal account: ${data.payer_email} :${data.residence_country}: (${data.payer_status})`;

  // if present, append cypherpunk account email
  if (user && user.email) {
    msg += `\rCypherpunk account: ${user.email} (${user.type})`;
  }

  switch (data.txn_type) {
    case 'subscr_signup':
      msg += `\rPayPal subscription ${data.subscr_id} to plan ${data.item_number}`;
      msg += `\rAutomatically renews every ${data.period3} for ${data.mc_amount3} ${data.mc_currency} starting on ${data.subscr_date}`;
      break;
    case 'subscr_payment':
      msg += `\rPayPal Payment ${data.mc_gross} received for subscription ${data.subscr_id} to plan ${data.item_number}!`;
      break;
    case 'subscr_cancel':
      msg += `\rCancelled their PayPal subscription ${data.subscr_id} to plan ${data.item_number}`;
      break;
    default:
      if (data.txn_type) {
        msg += `\rfrom paypal account ${data.payer_email} (${data.payer_status})`;
      }

      if (data.subscr_id) { msg += `\rfor subscription ${data.subscr_id}`; }
      if (data.item_number) { msg += `\rfor cypherpunk plan ${data.item_number}`; }
      if (data.period3) { msg += `\rperiod ${data.period3}`; }
      if (data.mc_amount3) { msg += `\ramount ${data.mc_amount3} ${data.mc_currency}`; }
  }

  // send to slack
  slack.billing(msg);
}

function onSubscriptionSignup (request, user, givenPlan, data) {
  // validate custom args
  if (!data.cypherpunk_account_id) { throw Boom.badRequest('Invalid Account Id'); }
  if (!data.cypherpunk_plan_type) { throw Boom.badRequest('Invalid Plan Type'); }

  // validate plan type
  let planType = request.plans.getPricingPlanType(data.cypherpunk_plan_type);
  if (!planType) { throw Boom.badRequest('Invalid Plan Type'); }

  // validate plan object and price
  let planId = data.item_number;
  let plan = request.plans.getPlanByTypeAndID(planType, planId);
  if (!plan) { throw Boom.badRequest('Unknown Paypal Item Number'); }
  if (+plan.price !== +data.mc_amount3) {
    throw Boom.badRequest(`Plan price doesn't match payment amount`);
  }

  return request.subscriptions.recordSubscription({
    user_id: user.id,
    type: plan.type,
    plan_id: plan.id,
    provider: 'paypal',
    renews: true,
    firstPaymentIncluded: false
  })
    .then(subscription => request.db('paypal_subscriptions').insert({
      subscription_id: subscription.id,
      stripe_id: data.subscr_id,
      stripe_data: data
    }));

  /*
  // find user by account id
  let user, subscription, subscriptionRenewal, columns = ['id', 'email', 'type'];
  let promise = request.db.select(columns).from('users').where({ id: data.cypherpunk_account_id })
  .then((data) => {
    if (data.length) { user = data[0]; }
    else { throw Boom.notFound('Cypherpunk Id not found'); }
  })
  // calculate subscription renewal
  .then(() => {
    subscriptionRenewal = request.subscriptions.calculateRenewal(planId);
    if (!subscriptionRenewal) {
      throw Boom.badImplementation('Unable to calculate subscription period');
    }
  })
  // create paypal object in db
  .then(() => {
    return request.db.insert({
      paypal_ident: data.subscr_id,
      paypal_data: data
    }).into('paypal').returning('*')
    .then((data) => { return data[0]; });
  })
  // create subscription
  // TODO: unset current on the default subscription object
  .then((provider) => {
    subscription = {
      user_id: user.id,
      type: planType,
      plan_id: planId,
      provider: 'paypal',
      provider_id: provider.id,
      active: true,
      current: true,
      start_timestamp: new Date(),
      purchase_timestamp: new Date(),
      expiration_timestamp: subscriptionRenewal,
      current_period_start_timestamp: new Date(),
      current_period_end_timestamp: subscriptionRenewal
    };
    return request.db.insert(subscription).into('subscriptions').returning('*')
    .then((data) => { subscription = data[0]; });
  })
  // TODO: update radius
  // send purchase email
  .then(() => {
    let msg = {
      to: user.email,
      subscriptionPrice: plan.price,
      subscriptionRenewal: planType,
      subscriptionExpiration: subscriptionRenewal
    };
    request.mailer.purchase(msg); // TODO catch and print?
  })
  // notify slack of new signup
  .then(() => { sendSlackNotification(request.slack, data, user); })
  .catch((err) => {
    if (err.isBoom) { return err; }
    else { return Boom.badImplementation(err); }
  });
  return h(promise);
  */
}

function onSubscriptionCancel (request, givenUser, givenPlan, data) {
  // validate custom args
  if (!data.cypherpunk_account_id) { throw Boom.badRequest('Invalid Account Id'); }

  // find user by account id
  let user;
  let columns = ['id', 'email', 'type'];
  return request.db.select(columns).from('users').where({ id: data.cypherpunk_account_id })
    .then((data) => {
      if (data.length) { user = data[0]; }
      else { throw Boom.notFound('Cypherpunk Id not found'); }
    })
    // notify slack of new signup
    .then(() => { sendSlackNotification(request.slack, data, user); })
    .catch((err) => {
      if (err.isBoom) { return err; }
      else { return Boom.badImplementation(err); }
    });
}

function onSubscriptionPayment (request, user, givenPlan, data) {
  // validate custom args
  if (!data.cypherpunk_account_id) { throw Boom.badRequest('Invalid Account Id'); }
  if (!data.cypherpunk_plan_type) { throw Boom.badRequest('Invalid Plan Type'); }

  // validate plan type
  let planType = request.plans.getPricingPlanType(data.cypherpunk_plan_type);
  if (!planType) { throw Boom.badRequest('Invalid Plan Type'); }

  // validate plan object and price
  let planId = data.item_number;
  let plan = request.plans.getPlanByTypeAndID(planType, planId);
  if (!plan) { throw Boom.badRequest('Unknown Paypal Item Number'); }
  if (+plan.price !== +data.mc_gross) {
    throw Boom.badRequest(`Plan price doesn't match payment amount`);
  }

  let date = new Date(data.payment_date);

  // this will throw an error if a subscription doesn't exist yet (e.g. notifications arrived out of order)
  return request.db('paypal_subscriptions').where({ paypal_id: data.subscr_id }).first()
  // recordSuccessfulPayment({ subscription_id, provider, transaction_id, user_id, plan_id, currency = 'USD', amount, date = new Date(), data }) {
    .then(row => request.subscriptions.recordSuccessfulPayment({
      subscription_id: row.subscription_id,
      provider: 'paypal',
      transaction_id: data.txn_id,
      user_id: data.cypherpunk_account_id,
      plan_id: plan.id,
      currency: 'USD',
      amount: plan.price,
      date: date,
      data: data
    }));

  /*
  .join('subscriptions', 'paypal_subscriptions.subscription_id', 'subscriptions.id').first()
  .then(row => {

  })

  // find user by account id
  let user, columns = ['users.id', 'users.email', 'users.type', 'subscriptions.id as sub_id'];
  let promise = request.db('users')
  .join('subscriptions', 'users.id', 'subscriptions.user_id')
  .where({
    'users.id': data.cypherpunk_account_id,
    'subscriptions.provider': 'paypal',
    'subscriptions.active': true,
    'subscriptions.plan_id': planId
  })
  .select(columns)
  .then((data) => {
    if (data.length) { user = data[0]; }
    else { throw Boom.notFound('Cypherpunk Account or Subscription not found'); }
  })
  // create new paypal charge
  .then(() => {
    return request.db.insert({
      gateway: 'paypal',
      transaction_id: data.txn_id,
      user_id: user.id,
      subscription_id: user.sub_id,
      plan_id: planId,
      currency: 'USD',
      amount: plan.price,
      data: data
    }).into('charges').returning('*');
  })
  // notify slack of new payment
  .then(() => { sendSlackNotification(request.slack, data, user); })
  .catch((err) => {
    if (err.isBoom) { return err; }
    else { return Boom.badImplementation(err); }
  });
  return h(promise);
  */
}

async function validateIPN (request, h) {
  let payload = request.payload.toString('utf8');
  console.log(payload);
  return request.paypal.validateIPN(payload)
    .then(() => qs.parse(payload))
    .catch(err => Boom.badRequest(err));
}
