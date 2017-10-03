const Joi = require('joi');
const Boom = require('boom');

module.exports = {
  method: 'GET',
  path: '/api/v1/admin/search',
  config: {
    auth: { strategy: 'session', mode: 'required' },
    validate: {
      query: Joi.object().keys({
        email: Joi.string().optional(),
        transactionId: Joi.string().optional()
      }).or('email', 'transactionId')
    },
    pre: [ { method: 'isAuthorized' } ]
  },
  handler: (request, reply) => {
    let promise;
    let email = request.query.email;
    let transId = request.query.transactionId;

    if (email) { promise = searchByEmail(request, email); }
    else if (transId) { promise = searchByTransactionId(request, transId); }
    else { promise = Boom.badRequest('Invalid Search Input'); }

    promise.catch((e) => {
      console.log(e);
      if (e.isBoom) { return e; }
      else { return Boom.badImplementation(e.message); }
    });
    return reply(promise);
  }
};

function searchByTransactionId(request, transId) {
  let columns = [
    'charges.id',
    'users.id as user_id',
    'users.email',
    'subscriptions.type as plan_type',
    'charges.user_id',
    'charges.subscription_id',
    'charges.created_at',
    'charges.updated_at',
    'charges.gateway',
    'charges.transaction_id'
  ];
  return request.db
  .select(columns)
  .from('charges')
  .join('users', 'users.id', 'charges.user_id')
  .join('subscriptions', 'subscriptions.id', 'charges.subscription_id')
  .where('charges.transaction_id', transId)
  .orderBy('charges.created_at')
  .then((data) => { return { results: data }; })
  .catch((e) => { return Boom.badImplementation(e); });
}

function searchByEmail(request, email) {
  let columns = [
    'users.id as user_id',
    'users.email',
    'users.created_at'
  ];
  return request.db
  .select(columns)
  .from('users')
  .where('email', email)
  .then((data) => { return { results: data }; })
  .catch((e) => { return Boom.badImplementation(e); });
}
