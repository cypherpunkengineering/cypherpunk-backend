const Boom = require('boom');

module.exports = {
  method: 'GET',
  path: '/api/v1/account/status',
  config: { auth: { mode: 'required' } },
  handler: (request, reply) => {
    let userId = request.auth.credentials.id;
    let user = {};
    let sub = {};
    let radius = {};

    let accountColumns = [
      'id',
      'email',
      'secret',
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
      .then((data) => { if (data.length) { sub = data[0]; } });
    })
    // get radius data
    .then(() => {
      return request.db.select('username', 'value').from('radius_tokens').where({ account: userId })
      .then((data) => {
        if (data.length) { radius = data[0]; }
        else { throw Boom.badRequest('Invalid Radius Account'); }
      });
    })
    // merge object into return value
    .then(() => {
      sub = sub || {};
      return {
        secret: user.secret || '',
        privacy: {
          username: radius.username,
          password: radius.value
        },
        account: {
          id: user.id,
          email: user.email,
          type: user.type,
          confirmed: user.confirmed || false,
        },
        subscription: {
          active: sub.active || true,
          renews: sub.renewal_timestamp ? true : false,
          type: sub.type || 'free',
          expiration: sub.expiration_timestamp || 0
        }
      };
    })
    .catch((err) => {
      console.log(err);
      if (err.isBoom) { return err; }
      else { return Boom.badImplementation(err); }
    });

    return reply(promise);
  }
};
