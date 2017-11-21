const Boom = require('boom');

module.exports = {
  method: 'POST',
  path: '/api/v1/ipn/bitpay',
  options: { auth: false },
  handler: async (request, h) => {
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
        if (data.status === 'confirmed') { return onInvoicePaid(request, h, data); }
        else {
          sendSlackNotification(request.slack, data);
          return h.response().code(200);
        }
      // send to billing channel on slack
      default:
        sendSlackNotification(request.slack, data);
        return Boom.badImplementation('Unknown BitPay IPN type!');
    }
  }
};

function sendSlackNotification (slack, data, user) {
  let msg = '[*BitPay*] ';

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

async function onInvoicePaid (request, h, data) {
  // validate custom args
  if (!data.cypherpunk_account_id) { return Boom.badRequest('Invalid Account Id'); }
  if (!data.cypherpunk_plan_type) { return Boom.badRequest('Invalid Plan Type'); }

  // validate plan type
  let planType = request.plans.getPricingPlanType(data.cypherpunk_plan_type);
  if (!planType) { return Boom.badRequest('Invalid Plan Type'); }
  console.log('PlanType: ', planType);

  // validate plan object and price
  let planId = request.plans.defaultPlanId[data.cypherpunk_plan_type];
  let plan = request.plans.getPlanByTypeAndID(planType, planId);
  if (!plan) { return Boom.badRequest('Unknown Subscription Plan'); }
  if (+plan.price !== +data.amount) {
    return Boom.badRequest(`Plan price doesn't match payment amount`);
  }
  console.log('Plan: ', planId, plan);

  // calculate subscription renewal
  let subscriptionRenewal = request.subscriptions.calculateRenewal(planId);
  if (!subscriptionRenewal) {
    return Boom.badImplementation('Unable to calculate subscription period');
  }
  console.log('SubscriptionRenewal: ', subscriptionRenewal);

  try {
    // get this user from DB
    let columns = ['id', 'email', 'type'];
    let whereConstraint = { id: data.cypherpunk_account_id };
    let user = await request.db.select(columns).from('users').where(whereConstraint);
    if (user.length) { user = user[0]; }
    else { return Boom.notFound('Cypherpunk Id not found'); }

    // create biypay object in db
    let bitpayData = { bitpay_ident: data.invoice_id, bitpay_data: data };
    let bitpay = await request.db.insert(bitpayData).into('bitpay').returning('*');
    if (bitpay.length) { bitpay = bitpay[0]; }
    else { return Boom.badImplementation('Could Not Create Bitpay Object'); }

    // create subscription
    // TODO: unset current on the default subscription object
    let subData = {
      user_id: user.id,
      type: planType,
      plan_id: planId,
      provider: 'bitpay',
      provider_id: bitpay.id,
      active: true,
      current: true,
      start_timestamp: new Date(),
      purchase_timestamp: new Date(),
      expiration_timestamp: subscriptionRenewal,
      current_period_start_timestamp: new Date(),
      current_period_end_timestamp: subscriptionRenewal
    };
    let subscription = await request.db.insert(subData).into('subscriptions').returning('*');
    if (subscription.length) { subscription = subscription[0]; }
    else { return Boom.badImplementation('Could Not Create Subscription Object'); }

    // create charge object
    let chargeData = {
      gateway: 'bitpay',
      transaction_id: data.invoice_id,
      user_id: user.id,
      subscription_id: subscription.id,
      plan_id: planId,
      currency: 'USD',
      amount: data.amount,
      data: data
    };
    await request.db.insert(chargeData).into('charges').returning('*');

    // TODO: update radius

    // send purchase email
    let msg = {
      to: user.email,
      subscriptionPrice: plan.price,
      subscriptionRenewal: planType,
      subscriptionExpiration: subscriptionRenewal
    };
    await request.mailer.purchase(msg);

    // notify slack of new signup
    sendSlackNotification(request.slack, data, user);

    // return status 200
    return h.response().code(200);
  }
  catch (err) { return Boom.badImplementation(err); }
}
