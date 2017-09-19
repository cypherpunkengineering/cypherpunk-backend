const db = require('../../database');
const randToken = require('rand-token');


// insert a user
let user = {
  email: 'ed+test@cypherpunk.com',
  password: 'testpassword',
  secret: randToken.generate(32),
  type: 'free',
  priority: 1,
  confirmed: false,
  confirmation_token: randToken.generate(32)
};
return db('users').insert(user).returning('*')
.then((user) => user[0])
// insert a subscription
.then((user) => {
  console.log('New User: ', user);

  let expDate = new Date();
  expDate.setTime(expDate.getTime() + (60* 1000));

  let subscription = {
    user_id: user.id,
    type: 'monthly',
    plan_id: 'monthly899',
    provider: 'amazon',
    active: true,
    current: true,
    start_timestamp: new Date(),
    purchase_timestamp: new Date(),
    expiration_timestamp: expDate,
    current_period_start_timestamp: new Date(),
    current_period_end_timestamp: expDate
  };
  return db('subscriptions').insert(subscription).returning('*');
})
.then((sub) => sub[0])
.then((sub) => {
  console.log('New Subscription: ', sub);

  // fire expired daemon
  require('./index');
});
