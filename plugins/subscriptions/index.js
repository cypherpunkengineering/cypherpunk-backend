const db = require('../../database');
const plans = require('../plans');
const stripe = require('../stripe');
const paypal = require('../paypal');
const alert = require('../alert');
const slack = require('../slack');

module.exports = {
  calculateRenewal: (plan, date) => {
    let subscriptionStart = date || new Date();
    let subscriptionRenewal = new Date(+subscriptionStart);

    if (plan === 'trial') {
      subscriptionRenewal.setDate(subscriptionStart.getDate() + 1);
    }
    else if (plan.startsWith('monthly')) {
      subscriptionRenewal.setDate(subscriptionStart.getDate() + 30);
    }
    else if (plan.startsWith('semiannually')) {
      subscriptionRenewal.setDate(subscriptionStart.getDate() + 180);
    }
    else if (plan.startsWith('annually')) {
      subscriptionRenewal.setDate(subscriptionStart.getDate() + 365);
    }
    else { return 0; }

    return subscriptionRenewal;
  },

  recordSubscription({ user_id, type, plan_id, provider, date = new Date(), renews = true, firstPaymentIncluded = false }) {
    let end = this.calculateRenewal(type, date);
    let oldSubscriptions, newSubscription;

    return Promise.resolve()
    .then(() => db('subscriptions').where({ user_id: user_id, current: true }).update({ current: false }).returning('*'))
    .then(rows => { oldSubscriptions = rows; })
    .then(() => db('subscriptions').insert({
      user_id,
      type,
      plan_id,
      provider,
      active: true,
      current: true,
      start_timestamp: date,
      purchase_timestamp: date,
      renewal_timestamp: renews ? end : null,
      expiration_timestamp: renews ? null : end,
      current_period_start_timestamp: date,
      current_period_end_timestamp: firstPaymentIncluded ? end : date,
    }).returning('*'))
    .then(row => { newSubscription = row[0]; })
    .then(() => {
      oldSubscriptions.forEach(sub => this.cancelSubscription({ subscription_id: sub.id, subscription: sub }));
    })
    .then(() => db('users').select(['email']).where({ id: user_id }).first().then(user => sendSlackNotification({ provider, type: 'subscription', message: `User ${user.email} created subscription for plan *${plan_id}*` })))
    .then(() => newSubscription);
  },

  recordSuccessfulPayment({ subscription_id, provider, transaction_id, user_id, plan_id, currency = 'USD', amount, date = new Date(), data }) {
    let end = this.calculateRenewal(plans.getPlanByID(plan_id).type, date);
    return db('charges').insert({
      gateway: provider,
      transaction_id,
      user_id,
      subscription_id,
      plan_id,
      currency,
      amount,
      data,
    }).returning('*')
    .then(charge => db('subscriptions').where({ id: subscription_id }).first()
      .then(subscription => {
        if (!subscription.active) { alert.notifySupport(new Error("Received payment on inactive subscription: " + charge.id)); }
        return db('subscriptions').where({ id: subscription_id }).update({
          updated_at: new Date(),
          renewal_timestamp: subscription.renewal_timestamp ? end : undefined,
          expiration_timestamp: subscription.expiration_timestamp ? end : undefined,
          current_period_start_timestamp: date,
          current_period_end_timestamp: end,
        });
      })
    )
    .then(() => db('users').select(['email']).where({ id: user_id }).first().then(user => sendSlackNotification({ provider, type: 'payment', message: `Received *${amount}* for user ${user.email} on plan *${plan_id}*` })))
    // TODO: send email if needed?
    ;
  },

  recordFailedPayment({}) {

  },

  cancelSubscription({ subscription_id, subscription }) {
    let now = new Date();
    return Promise.resolve(subscription || db('subscription').where({ id: subscription_id }).first())
    .then(subscription => {
      console.log("need to cancel " + subscription.id);
      let promise = Promise.resolve();
      if (subscription.active) {
        switch (subscription.provider) {
          case 'stripe': promise = db.select(['stripe_id']).from('stripe_subscriptions').where({ subscription_id: subscription_id }).first().then(row => stripe.api.subscriptions.del(row.stripe_id)); break;
          case 'paypal': promise = db.select(['paypal_id']).from('paypal_subscriptions').where({ subscription_id: subscription_id }).first().then(row => paypal.cancelSubscription(row.paypal_id)); break;
          default: console.warn("unhandled cancellation of subscription provider " + subscription.provider); break;
        }
      }
      return promise.then(() => db('subscriptions').where({ id: subscription_id }).update({
        active: false,
        renewal_timestamp: null,
        expiration_timestamp: subscription.expiration_timestamp || subscription.renewal_timestamp || subscription.current_period_end_timestamp || now,
        cancellation_timestamp: now,
        updated_at: now,
      }));
    });
  },
};

function sendSlackNotification({ provider, type, message }) {
  let msg = `[*${type.toUpperCase()}*] [*${provider.toUpperCase()}*] ${message}`;
  slack.billing(msg);
}
