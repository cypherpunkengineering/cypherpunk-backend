const db = require('../../database');
const schedule = require('node-schedule');


function findExpiring() {
  // next hour
  let expDate = new Date();
  expDate.setDate(expDate.getDate() - 16); // add 16 days
  expDate.setTime(expDate.getTime() + (60 * 60 * 1000)); // add one hour

  // get all fully expired users
  return getUsers(expDate)
  // schedule a expiration for each user returned
  .then((users) => {
    users.forEach((user) => {
      let expiry = user.expiration_timestamp;
      if (expiry < new Date()) { expireUser(user); }
      else { schedule.scheduleJob(user.expiration_timestamp, expireUser.bind(null, user)); }
    });
  });
}

function getUsers(date) {
  // get all users that expire in the next hour
  return db('users')
  .join('subscriptions', 'users.id', 'subscriptions.user_id')
  .whereNot({ 'users.type': 'expired' })
  .andWhere({ 'subscriptions.current': true })
  .andWhere('subscriptions.expiration_timestamp', '<', date)
  .select('users.id', 'users.email', 'users.type', 'subscriptions.expiration_timestamp');
}

function expireUser(user) {
  return db('users')
  .update({ type: 'expired' })
  .where({ id: user.id})
  .then(() => { console.log('Expired account: ' + user.email); });
}


// find expiring accounts on the hour
findExpiring();
schedule.scheduleJob('0 * * * *', findExpiring);
