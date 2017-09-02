const Joi = require('joi');
const Boom = require('boom');

module.exports = {
  method: 'GET',
  path: '/api/v1/account/status',
  config: { auth: { mode: 'required' } },
  handler: (request, reply) => {
    let userId = request.auth.credentials.account.id;
    let user = {};
    let sub = {};

    let accountColumns = [
      'id',
      'email',
      'secret',
      'privacy_username',
      'privacy_password',
      'type',
      'confirmed'
    ];
    let subColumns = [
      'active',
      'renewal_timestamp',
      'expiration_timestamp',
      'type'
    ];

    // get user data
    let promise = request.db.select(accountColumns).from('users').where({ id: userId })
    .then((data) => {
      if (data.length) { user = data[0]; }
      else { throw Boom.badRequest('Invalid Session'); }
    })
    // get user subscription data
    .then(() => {
      return request.db.select(subColumns).from('subscriptions').where({ user_id: userId })
      .then((data) => {
        if (data.length) { sub = data[0]; }
        else { throw Boom.badRequest('Invalid Session'); }
      });
    })
    // merge object into return value
    .then(() => {
      return {
        secret: user.secret || '',
        privacy: {
          username: user.privacy_username,
          password: user.privacy_password
        },
        account: {
          id: user.id,
          email: user.email,
          type: user.type,
          confirmed: user.confirmed || false,
        },
        subscription: {
          active: sub.active,
          renews: sub.renewal_timestamp ? true : false,
          type: sub.type || 'preview',
          expiration: sub.expiration_timestamp || null
        }
      };
    })
    .catch((err) => { return Boom.badImplementation(err); });

    return reply(promise);
  }
}
