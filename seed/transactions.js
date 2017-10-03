const db = require('../database');

// create a new subscription
db('subscriptions').insert({
  user_id: 'dcde9fca-4634-4d83-affc-85393793fd32',
  type: 'monthly',
  active: true,
  current: true
})
.returning('*')
.then((sub) => {
  sub = sub[0];
  return db('charges')
  .insert({
    user_id: 'dcde9fca-4634-4d83-affc-85393793fd32',
    subscription_id: sub.id,
    gateway: 'stripe',
    transaction_id: 'txnId',
    plan_id: 'monthly899',
    currency: 'USD',
    amount: '8.99',
    data: {}
  });
})
.then(() => {
  process.exit();
});
