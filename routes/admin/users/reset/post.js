const Joi = require('joi');
const Boom = require('boom');
const randToken = require('rand-token');

module.exports = {
  method: 'POST',
  path: '/api/v1/admin/users/{id}/reset',
  options: {
    auth: { strategy: 'session', mode: 'required' },
    validate: { params: { id: Joi.string().required() } },
    pre: [ { method: isAuthorized } ]
  },
  handler: async (request, h) => {
    let userId = request.params.id;

    try {
      let user = await request.db('users').update({ recovery_token: randToken.generate(32) })
        .where({ id: userId }).returning(['id', 'email', 'recovery_token']);

      let msg = { to: user.email, id: user.id, recoveryToken: user.recovery_token };
      await request.mailer.recovery(msg);

      return h.response().code(200);
    }
    catch (err) { return Boom.badImplementation(err); }
  }
};

async function isAuthorized (request, h) {
  return request.server.methods.isAuthorized(request, h);
}
