const Joi = require('joi');
const Boom = require('boom');

module.exports = {
  method: 'GET',
  path: '/api/v1/admin/users',
  options: {
    auth: { strategy: 'session', mode: 'required' },
    // auth: false,
    validate: {
      query: Joi.object().keys({
        created_at: Joi.string().optional(),
        last_id: Joi.string().optional()
      }).and('created_at', 'last_id')
    },
    pre: [ { method: isAuthorized } ]
  },
  handler: async (request, h) => {
    let start = request.query.created_at || 0;
    let lastId = request.query.last_id || '';
    let startDate = new Date(Number(start));

    let columns = [
      'id',
      'email',
      'type',
      'confirmed',
      'created_at',
      'updated_at',
      'last_login'
    ];

    try {
      let data = await request.db.select(columns).from('users')
        .where('created_at', '>=', startDate)
        .andWhere(function () { if (lastId) { this.whereNot({ id: lastId }); } })
        .orderBy('created_at').limit(26);

      let value = { users: data };
      if (value.users.length > 25) { value.hasMore = true; }
      else { value.hasMore = false; }
      if (value.users.length > 25) { value.users.pop(); }
      return value;
    }
    catch (err) { return Boom.badImplementation(err); }
  }
};

async function isAuthorized (request, h) {
  return request.server.methods.isAuthorized(request, h);
}
