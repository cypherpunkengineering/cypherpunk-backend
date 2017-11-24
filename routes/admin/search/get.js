const Joi = require('joi');
const Boom = require('boom');

module.exports = {
  method: 'GET',
  path: '/api/v1/admin/search',
  options: {
    auth: { strategy: 'session', mode: 'required' },
    validate: {
      query: Joi.object().keys({
        email: Joi.string().optional(),
        transactionId: Joi.string().optional()
      }).or('email', 'transactionId')
    },
    pre: [ { method: isAuthorized } ]
  },
  handler: async (request, h) => {
    let email = request.query.email;
    let transId = request.query.transactionId;

    try {
      let results;
      if (email) { results = await searchByEmail(request, email); }
      else if (transId) { results = await searchByTransactionId(request, transId); }
      else { results = Boom.badRequest('Invalid Search Input'); }
      return results;
    }
    catch (err) { return Boom.badImplementation(err); }
  }
};

async function searchByTransactionId (request, transId) {
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
  let results = await request.db.select(columns).from('charges')
    .join('users', 'users.id', 'charges.user_id')
    .join('subscriptions', 'subscriptions.id', 'charges.subscription_id')
    .where('charges.transaction_id', transId)
    .orderBy('charges.created_at');
  return { results: results };
}

async function searchByEmail (request, email) {
  let columns = [
    'users.id as user_id',
    'users.email',
    'users.created_at'
  ];
  let results = await request.db.select(columns).from('users').where('email', email);
  return { results: results };
}

async function isAuthorized (request, h) {
  return request.server.methods.isAuthorized(request, h);
}
