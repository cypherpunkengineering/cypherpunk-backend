const db = require('../../database');
const schedule = require('node-schedule');
const mailer = require('../../plugins/sendgrid');

// TESTING
// let rounds = 0;
// TESTING

function init() {
  // TESTING
  // console.log(rounds++);
  // TESTING

  findUsers(1)
  .then(() => { findUsers(4); })
  .then(() => { findUsers(9); })
  .then(() => { findUsers(12); })
  .then(() => { findUsers(15); })
  .then(() => { findUsers(16); });
}

function findUsers(days) {
  // next hour
  let expDate = new Date();
  expDate.setDate(expDate.getDate() - days);
  expDate.setTime(expDate.getTime() + (60 * 60 * 1000)); // add one hour

  // TESTING
  // expDate.setTime(expDate.getTime() - (1000 * 60 * days));
  // TESTING

  // get all delinquient user account
  return getUsers(expDate, days)
  // schedule a expiration for each user returned
  .then((users) => {

    // TESTING
    // console.log(users);
    // TESTING

    users.forEach((user) => {
      let expiry = user.last_warning_id;

      // use expiration date on the first day
      if (days === 1) { expiry = user.expiration_timestamp; }

      if (expiry < new Date()) { emailUser(user, days); }
      else { schedule.scheduleJob(expiry, emailUser.bind(null, user, days)); }
    });
  });
}

function getUsers(date, days) {
  // get all user based on days passed
  return db('users')
  .join('subscriptions', 'users.id', 'subscriptions.user_id')
  .whereNot({ 'users.type': 'expired' })
  .andWhere('subscriptions.last_warning_id', '<', days)
  .andWhere({ 'subscriptions.current': true })
  .andWhere('subscriptions.expiration_timestamp', '<', date)
  .select(
    'users.id',
    'users.email',
    'users.type',
    'subscriptions.id as subscription_id',
    'subscriptions.expiration_timestamp',
    'subscriptions.last_warning_id');
}

function emailUser(user, days) {
  // send correct email based on days
  mailer.subscriptionWarning({
    days: days,
    to: user.email
  });

  // update user with last_warning_id
  return db('subscriptions')
  .update({ last_warning_id: days })
  .where({ id: user.subscription_id })
  .then(() => { console.log(`Notified account: ${user.email} on day ${days}`); });
}


// find expiring accounts on the hour
init();
schedule.scheduleJob('* * * * *', init); // 0 * * * *
