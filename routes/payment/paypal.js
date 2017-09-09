const Boom = require('boom');

module.exports = {
  method: 'POST',
  path: '/api/v1/ipn/paypal',
  config: { auth: false },
  handler: (request, reply) => {
    console.log(request.payload);

    // convert custom string into JS object
    let data = request.payload;
    try {
      data.custom = JSON.parse(request.payload.custom);
      data.cypherpunk_account_id = data.custom.id;
      data.cypherpunk_plan_type = request.plans.getPricingPlanType(data.custom.plan);
    }
    catch (e) { data.custom = {}; }

    // use txn_type to switch on how to handle this message
    switch (data.txn_type) {
      case 'subscr_signup':
        onSubscriptionSignup(request, reply, data);
        break;
      case 'subscr_cancel':
        onSubscriptionCancel(request, reply, data);
        break;
      case 'subscr_payment':
        onSubscriptionPayment(request, reply, data);
        break;
      case 'subscr_eot':
        sendSlackNotification(request.slack, data);
        return reply();
      default:
        // send to billing channel on slack
        sendSlackNotification(request.slack, data);
        return reply(Boom.badImplementation('Unknown PayPal IPN type!'));
    }
  }
};

function sendSlackNotification(slack, data, user) {
  let msg = "[*PayPal*] ";

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

function onSubscriptionSignup(request, reply, data) {
  // validate custom args
  if (!data.cypherpunk_account_id) { return reply(Boom.badRequest('Invalid Account Id')); }
  if (!data.cypherpunk_plan_type) { return reply(Boom.badRequest('Invalid Plan Type')); }

  // validate plan type
  let planType = request.plans.getPricingPlanType(data.cypherpunk_plan_type);
  if (!planType) { return reply(Boom.badRequest('Invalid Plan Type')); }

  // validate plan object and price
  let planId = data.item_number;
  let plan = request.plans.getPlanByTypeAndID(planType, planId);
  if (!plan) { return reply(Boom.badRequest('Unknown Paypal Item Number')); }
  if (+plan.price !== +data.mc_amount3) {
    return reply(Boom.badRequest(`Plan price doesn't match payment amount`));
  }

  // find user by account id
  let user, subscriptionRenewal, columns = ['id', 'email'];
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
    }).into('paypal').returning('id')
    .then((data) => { return data[0]; });
  })
  // create subscription
  .then((provider) => {
    let subscription = {
      user_id: user.id,
      type: planType,
      plan_id: planId,
      provider: 'paypal',
      provider_id: provider.id,
      active: true,
      current: true,
      start_timestamp: new Date(),
      purchase_timestamp: new Date(),
      renewal_timestamp: subscriptionRenewal,
      current_period_start_timestamp: new Date(),
      current_period_end_timestamp: subscriptionRenewal
    };
    return request.db.insert(subscription).into('subscriptions').returning('*');
  })
  // TODO: update radius
  // send purchase email
  .then(() => {
    let msg = {
      to: user.email,
      subscriptionPlan: plan.price,
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

function onSubscriptionCancel(request, reply, data) {
  // validate custom args
  if (!data.cypherpunk_account_id) { return reply(Boom.badRequest('Invalid Account Id')); }
  if (!data.cypherpunk_plan_type) { return reply(Boom.badRequest('Invalid Plan Type')); }

  // find user by account id
  let user, columns = ['id', 'email'];
  let promise = request.db.select(columns).from('users').where({ id: data.cypherpunk_account_id })
  .then(() => {
    if (data.length) { user = data[0]; }
    else { throw Boom.notFound('Cypherpunk Id not found'); }
  })
  // TODO: create charge object for paypal
  // notify slack of new signup
  .then(() => { sendSlackNotification(request, data, user); })
  .catch((err) => {
    if (err.isBoom) { return err; }
    else { return Boom.badImplementation(err); }
  });
  return reply(promise);
}

function onSubscriptionPayment(request, reply, data) {
  // validate custom args
  if (!data.cypherpunk_account_id) { return reply(Boom.badRequest('Invalid Account Id')); }
  if (!data.cypherpunk_plan_type) { return reply(Boom.badRequest('Invalid Plan Type')); }

  // find user by account id
  let user, columns = ['id', 'email'];
  let promise = request.db.select(columns).from('users').where({ id: data.cypherpunk_account_id })
  .then(() => {
    if (data.length) { user = data[0]; }
    else { throw Boom.notFound('Cypherpunk Id not found'); }
  })
  // notify slack of new signup
  .then(() => { sendSlackNotification(request, data, user); })
  .catch((err) => {
    if (err.isBoom) { return err; }
    else { return Boom.badImplementation(err); }
  });
  return reply(promise);
}
