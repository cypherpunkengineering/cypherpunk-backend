const Joi = require('joi');
const Boom = require('boom');

module.exports = {
  method: 'GET',
  path: '/api/v1/admin/users/{id}',
  config: {
    auth: { strategy: 'session', mode: 'required' },
    // auth: false,
    validate: {
      params: { id: Joi.string().optional() }
    },
    pre: [ { method: 'isAuthorized' } ]
  },
  handler: (request, reply) => {
    let userId = request.params.id;

    let promises = [
      getUserAccountInfo(request.db, userId),
      getUserSubscrptions(request.db, userId)
    ];

    let promise = Promise.all(promises)
    .then((values) => {
      let account = values[0];
      account.subscriptions = values[1];
      return account;
    })
    .catch((e) => {
      console.log(e);
      if (e.isBoom) { return e; }
      else { return Boom.badImplementation(e); }
    });
    return reply(promise);
  }
};

function getUserAccountInfo(db, userId) {
  let columns = [
    'id',
    'email',
    'type',
    'confirmed',
    'created_at',
    'updated_at',
    'last_login',
  ];
  return db
  .select(columns)
  .from('users')
  .where({ id: userId })
  .then((data) => {
    if (data.length) { return data[0]; }
    else { return Boom.notFound('User Not Found'); }
  });
}

function getUserSubscrptions(db, userId) {
  let columns = [
    'id',
    'type',
    'plan_id',
    'provider',
    'active',
    'current',
    'created_at',
    'updated_at',
    'start_timestamp',
    'purchase_timestamp',
    'renewal_timestamp',
    'expiration_timestamp',
    'cancellation_timestamp',
    'current_period_start_timestamp',
    'current_period_end_timestamp'
  ];
  return db
  .select(columns)
  .from('subscriptions')
  .where({ user_id: userId });
}
