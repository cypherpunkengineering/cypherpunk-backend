const Boom = require('boom');

module.exports = {
  method: 'POST',
  path: '/api/v1/ipn/bitpay',
  config: { auth: false },
  handler: (request, reply) => {
    // convert custom string into JS object
    let data = request.payload;
    try {
      data.posData = JSON.parse(request.payload.posData);
      data.cypherpunk_account_id = data.posData.id;
      data.cypherpunk_plan_type = request.plans.getPricingPlanType(data.posData.plan);
    }
    catch (e) { data.custom = {}; }

    // use action to switch on how to handle this message
    switch (data.action) {
      case 'invoiceStatus':
        if (data.status === 'confirmed') {
          onInvoicePaid(request, reply, data);
        }
        else { sendSlackNotification(request.slack, data).then(() => { return reply(); }); }
        break;
      // send to billing channel on slack
      default:
        sendSlackNotification(request.slack, data);
        return reply(Boom.badImplementation('Unknown BitPay IPN type!'));
    }
  }
};

function sendSlackNotification(slack, data, user) {
  let msg = "[*BitPay*] ";

  switch (data.action) {
    case 'invoiceStatus':
      if (data.status === 'confirmed') { msg += '[*PAYMENT*] :moneybag:'; }
      else { msg += `[*INVOICE*] ${data.status.toUpperCase()}]`; }
      break;
    default:
      msg += `[*${data.action.toUpperCase()}*]`;
  }

  // indent slack style
  msg += '\r>>>\r';

  // if present, append cypherpunk account email
  if (user && user.email) {
    msg += `\rCypherpunk account: ${user.email} (${user.type})`;
  }

  msg += `\rBitPay invoice ${data.invoice_id} is ${data.status}`;
  msg += `\rAmount: ₿ ${data.btcPaid} BTC -> ${data.amount} USD`;

	// send to slack
	slack.billing(msg);
}

function onInvoicePaid(request, reply, data) {
  // validate custom args
  if (!data.cypherpunk_account_id) { return reply(Boom.badRequest('Invalid Account Id')); }
  if (!data.cypherpunk_plan_type) { return reply(Boom.badRequest('Invalid Plan Type')); }

  // validate plan type
  let planType = request.plans.getPricingPlanType(data.cypherpunk_plan_type);
  if (!planType) { return reply(Boom.badRequest('Invalid Plan Type')); }
  console.log('PlanType: ', planType);

  // validate plan object and price
  let planId = request.plans.defaultPlanId[data.cypherpunk_plan_type];
  let plan = request.plans.getPlanByTypeAndID(planType, planId);
  if (!plan) { return reply(Boom.badRequest('Unknown Subscription Plan')); }
  if (+plan.price !== +data.amount) {
    return reply(Boom.badRequest(`Plan price doesn't match payment amount`));
  }
  console.log('Plan: ', planId, plan);

  // calculate subscription renewal
  let subscriptionRenewal = request.subscriptions.calculateRenewal(planId);
  if (!subscriptionRenewal) {
    throw Boom.badImplementation('Unable to calculate subscription period');
  }
  console.log('SubscriptionRenewal: ', subscriptionRenewal);

  // find user by account id
  let user, subscription, columns = ['id', 'email', 'type'];
  let promise = request.db.select(columns).from('users').where({ id: data.cypherpunk_account_id })
  .then((data) => {
    if (data.length) { user = data[0]; }
    else { throw Boom.notFound('Cypherpunk Id not found'); }
  })
  // create paypal object in db
  .then(() => {
    return request.db.insert({
      bitpay_ident: data.invoice_id,
      bitpay_data: data
    }).into('bitpay').returning('*')
    .then((data) => { return data[0]; });
  })
  // create subscription
  // TODO: unset current on the default subscription object
  .then((provider) => {
    subscription = {
      user_id: user.id,
      type: planType,
      plan_id: planId,
      provider: 'bitpay',
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
  // create charge object
  .then(() => {
    return request.db.insert({
      gateway: 'bitpay',
      transaction_id: data.invoice_id,
      user_id: user.id,
      subscription_id: subscription.id,
      plan_id: planId,
      currency: 'USD',
      amount: data.amount,
      data: data
    }).into('charges').returning('*');
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
  return reply(promise);
}
