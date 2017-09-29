const Joi = require('joi');
const Boom = require('boom');
const randToken = require('rand-token');

module.exports = {
  method: 'POST',
  path: '/api/v1/admin/users/{id}/reset',
  config: {
    auth: { strategy: 'session', mode: 'required' },
    validate: { params: { id: Joi.string().required() } },
    pre: [ { method: 'isAuthorized' } ]
  },
  handler: (request, reply) => {
    let userId = request.params.id;

    let promise = request.db('users').update({
      recovery_token: randToken.generate(32)
    })
    .where({ id: userId })
    .returning(['id', 'email', 'recovery_token'])
    .tap(console.log)
    .then((user) => {
      let msg = { to: user.email, id: user.id, recoveryToken: user.recovery_token };
      return request.mailer.recovery(msg);
    })
    .catch((err) => {
      console.log(err);
      if (err.isBoom) { return err; }
      else { return Boom.badImplementation(err.message); }
    });
    return reply(promise);
  }
};
