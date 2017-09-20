const db = require('../../database');
const schedule = require('node-schedule');
const slack = require('../../plugins/slack');
const amazon = require('../../plugins/amazon');
const subscriptions = require('../../plugins/subscriptions');


function findAmazonRecurring() {
  // one hour ahead from now
  let recurDate = new Date();
  recurDate.setTime(recurDate.getTime() + (60 * 60 * 1000));

  let columns = [
    'users.id',
    'users.email',
    'subscriptions.id as sub_id',
    'subscriptions.plan_id',
    'subscriptions.current_period_end_timestamp',
    'amazon.billing_agreement_id',
    'amazon.amazon_data'
  ];
  return db('users')
  .join('subscriptions', 'users.id', 'subscriptions.user_id')
  .join('amazon', 'subscriptions.provider_id', 'amazon.id')
  .where('subscriptions.current_period_end_timestamp', '<', recurDate)
  .andWhere({ 'subscriptions.current': true })
  .andWhere({ 'subscriptions.provider': 'amazon' })
  .select(columns)
  // schedule a charge for each user returned
  .then((users) => {
    users.forEach((user) => {
      let expiry = user.current_period_end_timestamp;
      if (expiry < new Date()) { chargeUser(user); }
      else { schedule.scheduleJob(user.current_period_end_timestamp, chargeUser.bind(null, user)); }
    });
  });
}

function chargeUser(user) {
  // generate subscription renewal date
  let subscriptionRenewal = subscriptions.calculateRenewal(user.plan_id, user.current_period_end_timestamp);
  if (!subscriptionRenewal) { return console.log('Could not (amazon) charge user: ', user.id); }

  // amazon args
  let amazonArgs = {
    plan: user.plan_id,
    AmazonBillingAgreementId: user.billing_agreement_id
  };
  return amazon.confirmBillingAgreement(amazonArgs)
  .then(() => {
    let authorizeArgs = {
      AmazonBillingAgreementId: user.billing_agreement_id,
      currency: 'USD',
      price: user.amazon_data.price,
      authorizationReference: user.amazon_data.authorizationReference,
      userId: user.id
    };
    return amazon.authorizeOnBillingAgreement(authorizeArgs);
  })
  .then(() => {
    return db.insert({
      gateway: 'amazon',
      transaction_id: user.amazon_data.authorizationReference,
      user_id: user.id,
      plan_id: user.plan_id,
      currency: 'USD',
      amount: user.amazon_data.price,
      data: user.amazon_data
    }).into('charges').returning('*');
  })
  // update subscription so this doesn't show up again
  .then(() => {
    return db('subscriptions').update({
      current_period_start_timestamp: user.current_period_end_timestamp,
      current_period_end_timestamp: subscriptionRenewal,
      renewal_timestamp: subscriptionRenewal,
      expiration_timestamp: subscriptionRenewal
    })
    .where({ id : user.sub_id });
  })
  .then(() => {
    console.log(`Payment of ${user.amazon_data.price} was made via amazon by ${user.email}`);
  })
  // post payment in slack
  .then(() => {
    let text = `[RECURRING] ${user.email} has made a payment of ${user.amazon_data.price} via Amazon :highfive:`;
      slack.billing(text); // TODO catch and print?
  })
  .catch((e) => { console.log(e); });
}


findAmazonRecurring();
schedule.scheduleJob('0 * * * *', findAmazonRecurring);
