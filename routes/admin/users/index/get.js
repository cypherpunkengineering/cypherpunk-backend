const Joi = require('joi');
const Boom = require('boom');

module.exports = {
  method: 'GET',
  path: '/api/v1/admin/users',
  config: {
    auth: { strategy: 'session', mode: 'required' },
    // auth: false,
    validate: {
      query: Joi.object().keys({
        created_at: Joi.string().optional(),
        last_id: Joi.string().optional()
      }).and('created_at', 'last_id')
    }
  },
  handler: (request, reply) => {
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
      'last_login',
    ];
    let promise = request.db
    .select(columns)
    .from('users')
    .where('created_at', '>=', startDate)
    .andWhere(function() {
      if (lastId) { this.whereNot({ id: lastId }); }
    })
    .orderBy('created_at')
    .limit(26)
    .then((data) => {
      let value = { users: data };

      if (value.users.length > 25) { value.hasMore = true;}
      else { value.hasMore = false; }
      if (value.users.length > 25) { value.users.pop(); }

      return value;
    })
    .catch((e) => { return Boom.badImplementation(e); });
    return reply(promise);
  }
};
