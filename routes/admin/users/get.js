const Joi = require('joi');
const Boom = require('boom');

module.exports = {
  method: 'GET',
  path: '/api/v1/admin/users/{id}',
  options: {
    auth: { strategy: 'session', mode: 'required' },
    // auth: false,
    validate: {
      params: { id: Joi.string().optional() }
    },
    pre: [ { method: isAuthorized } ]
  },
  handler: async (request, h) => {
    let userId = request.params.id;

    let promises = [
      getUserAccountInfo(request.db, userId),
      getUserSubscriptions(request.db, userId)
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
    return promise;
  }
};

async function getUserAccountInfo (db, userId) {
  let columns = [
    'id',
    'email',
    'type',
    'confirmed',
    'deactivated',
    'created_at',
    'updated_at',
    'last_login'
  ];
  return db
    .select(columns)
    .from('users')
    .where({ id: userId })
    .then((data) => {
      if (data.length) { return data[0]; }
      else { Promise.reject(Boom.notFound('User Not Found')); }
    });
}

async function getUserSubscriptions (db, userId) {
  return db.raw(`
    SELECT
      s.id,
      s.type,
      s.plan_id,
      s.provider,
      s.active,
      s.current,
      s.created_at,
      s.updated_at,
      s.start_timestamp,
      s.purchase_timestamp,
      s.renewal_timestamp,
      s.expiration_timestamp,
      s.cancellation_timestamp,
      s.current_period_start_timestamp,
      s.current_period_end_timestamp,
      (
        SELECT array_to_json(array_agg(row_to_json(r)))
        FROM (
          SELECT
            id,
            created_at,
            gateway,
            transaction_id,
            plan_id,
            currency,
            amount,
            refunded,
            refund_amount,
            refund_date
          FROM charges c
          WHERE c.subscription_id = s.id
        ) r
      ) as charges
    FROM subscriptions s
    WHERE s.user_id = ?
  `, [userId])
    .then((response) => { return response.rows; });
}

async function isAuthorized (request, h) {
  return request.server.methods.isAuthorized(request, h);
}
