const Joi = require('joi');
const Boom = require('boom');
const randToken = require('rand-token');

module.exports = {
  method: 'POST',
  path: '/api/v1/admin/users/{id}/deactivate',
  config: {
    auth: { strategy: 'session', mode: 'required' },
    validate: { params: { id: Joi.string().required() } },
    pre: [{ method: 'isAuthorized' }]
  },
  handler: (request, reply) => {
    let userId = request.params.id;

    /// get this user by user_id
    let promise = request.db.select('email').from('users').where({ id: userId }).first()
    .then((data) => {
      if (data) { return data; }
      else { return Promise.reject(Boom.badRequest('User Not Found')); }
    })
    // set user's deactivated flag to true, mangle email, delete password
    .then((user) => {
      return request.db('users').update({
        password: null,
        deactivated: true,
        email: user.email + ':deactivated:' + randToken.generate(32)
      })
      .where({ id: userId });
    })
    // set any user subscriptions to cancelled
    .then(() => {
      return request.db('subscriptions')
      .update({ cancellation_timestamp: request.db.fn.now() })
      .where({ current: true, user_id: userId });
    })
    // set all subscriptions to not active or current
    .then(() => {
      return request.db('subscriptions')
      .update({ active: false, current: false })
      .where({ user_id: userId });
    })
    .then(() => { return; })
    .catch((err) => {
      console.log(err);
      if (err.isBoom) { return err; }
      else { return Boom.badImplementation(err.message); }
    });
    return reply(promise);
  }
};
