const Joi = require('joi');
const Boom = require('boom');
const randToken = require('rand-token');

module.exports = {
  method: 'POST',
  path: '/api/v1/admin/users/{id}/deactivate',
  options: {
    auth: { strategy: 'session', mode: 'required' },
    validate: { params: { id: Joi.string().required() } },
    pre: [{ method: isAuthorized }]
  },
  handler: async (request, h) => {
    let userId = request.params.id;

    try {
      /// get this user by user_id
      let user = await request.db.select('email').from('users').where({ id: userId }).first();

      // set user's deactivated flag to true, mangle email, delete password
      await request.db('users').update({
        password: null,
        deactivated: true,
        email: user.email + ':deactivated:' + randToken.generate(32)
      }).where({ id: userId });

      // set any user subscriptions to cancelled
      await request.db('subscriptions')
        .update({ cancellation_timestamp: request.db.fn.now() })
        .where({ current: true, user_id: userId });

      // set all subscriptions to not active or current
      await request.db('subscriptions')
        .update({ active: false, current: false })
        .where({ user_id: userId });

      return h.response().code(200);
    }
    catch (err) { return Boom.badImplementation(err); }
  }
};

async function isAuthorized (request, h) {
  return request.server.methods.isAuthorized(request, h);
}
