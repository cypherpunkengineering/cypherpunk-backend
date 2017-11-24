const Boom = require('boom');

module.exports = {
  method: 'GET',
  path: '/api/v1/admin/users/counts',
  options: {
    auth: { strategy: 'session', mode: 'required' },
    // auth: false
    pre: [ { method: isAuthorized } ]
  },
  handler: async (request, h) => {
    let promises = [
      trialUsers(request),
      inactiveTrialUsers(request),
      confirmedTrials(request),
      unconfirmedTrials(request),
      premiumUsers(request),
      activeUsers(request),
      activeCancelledUsers(request),
      inactiveUsers(request),
      request.db.select('count').from('user_counters').where({ type: 'registered' }).then(scalar),
      request.db.select('count').from('user_counters').where({ type: 'confirmed' }).then(scalar)
    ];

    try {
      let counts = await Promise.all(promises);
      return {
        trial: {
          total: counts[0],
          inactive: counts[1],
          confirmed: counts[2],
          unconfirmed: counts[3]
        },
        premium: {
          total: counts[4],
          active: counts[5],
          cancelled: counts[6],
          inactive: counts[7]
        },
        total: {
          registered: counts[8],
          confirmed: counts[9]
        }
      };
    }
    catch (err) { return Boom.badImplementation(err); }
  }
};


function scalar (data) {
  if (data.length) { return parseInt(data[0].count); }
  else { return 0; }
}

function trialUsers (request) {
  return request.db('users')
    .count('type')
    .whereIn('type', ['trial', 'pending', 'invitation', 'free'])
    .where({ deactivated: false })
    .then(scalar);
}

function confirmedTrials (request) {
  return request.db('users')
    .count('type')
    .whereIn('type', ['trial', 'pending', 'invitation', 'free'])
    .andWhere('confirmed', true)
    .then(scalar);
}

function unconfirmedTrials (request) {
  return request.db('users')
    .count('type')
    .whereIn('type', ['trial', 'pending', 'invitation', 'free'])
    .andWhere('confirmed', false)
    .then(scalar);
}

function premiumUsers (request) {
  return request.db('users')
    .count('type')
    .where('type', 'premium')
    .then(scalar);
}

function activeUsers (request) {
  return request.db('users')
    .join('subscriptions', 'users.id', 'subscriptions.user_id')
    .where({ 'users.type': 'premium' })
    .andWhere('subscriptions.current', '=', true)
    .andWhere('subscriptions.current_period_end_timestamp', '>', request.db.fn.now())
    .whereNull('subscriptions.cancellation_timestamp')
    .whereNull('subscriptions.renewal_timestamp')
    .count('users.type')
    .then(scalar);
}

function activeCancelledUsers (request) {
  return request.db('users')
    .join('subscriptions', 'users.id', 'subscriptions.user_id')
    .where({ 'users.type': 'premium' })
    .andWhere('subscriptions.current', '=', true)
    .andWhere('subscriptions.current_period_end_timestamp', '>', request.db.fn.now())
    .andWhere(function () {
      this.whereNotNull('subscriptions.cancellation_timestamp')
        .orWhereNotNull('subscriptions.renewal_timestamp');
    })
    .count('users.type')
    .then(scalar);
}

function inactiveTrialUsers (request) {
  return request.db('users')
    .count('type')
    .whereIn('type', ['trial', 'pending', 'invitation', 'free'])
    .where({ deactivated: true })
    .then(scalar);
}

function inactiveUsers (request) {
  let promises = [];

  promises.push(request.db('users')
    .join('subscriptions', 'users.id', 'subscriptions.user_id')
    .where({ 'users.type': 'premium' })
    .where('subscriptions.current', '=', true)
    .andWhere('subscriptions.current_period_end_timestamp', '<', request.db.fn.now())
    .count('users.type')
    .then(scalar)
  );

  promises.push(request.db('users')
    .leftJoin('subscriptions', 'users.id', 'subscriptions.user_id')
    .where({ 'users.type': 'premium' })
    .whereNull('subscriptions.id')
    .count('users.type')
    .then(scalar)
  );

  return Promise.all(promises)
    .then(data => { return data[0] + data[1]; });
}

async function isAuthorized (request, h) {
  return request.server.methods.isAuthorized(request, h);
}
