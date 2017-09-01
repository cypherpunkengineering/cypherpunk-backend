const Joi = require('joi');
const Boom = require('boom');
const bcrypt = require('bcrypt');
const randToken = require('rand-token');

module.exports = {
  method: 'POST',
  path: '/api/v1/account/register/signup',
  config: {
    auth: { strategy: 'session', mode: 'try' },
    validate: {
      payload: {
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required()
      }
    }
  },
  handler: (request, reply) => {
    console.log('here');
    if (request.auth.isAuthenticated) { return reply.redirect('/'); }

    // check if email already exists

    // create user
    let promise = request.db.insert({
      email: request.payload.email.toLowerCase(),
      password: bcrypt.hashSync(request.payload.password, 15),
      secret: randToken.generate(32),
      type: 'free',
      priority: 1,
      confirmed: false,
      confirmation_token: randToken.generate(32),
      privacy_username: randToken.generate(32),
      privacy_password: randToken.generate(32)
    })
    .into('users')
    .returning('*')
    // create stripe
    // TODO: create default stripe subscription customer object
    // create subscription
    .then((user) => {
      user = user[0];
      return request.db.insert({ user_id: user.id, current: true })
      .into('subscriptions')
      .returning('*')
      .then(() => { return user; });
    })
    // create session and cookie for user
    .then((user) => {
      return new Promise((resolve, reject) => {
        // set session? cookie? I forget.
        request.server.app.cache.set('user:' + user.id, { account: user }, 0, (err) => {
          if (err) { return reject(err); }
          request.cookieAuth.set({ sid: 'user:' + user.id });
          return resolve();
        });
      });
    })
    // TODO: update radius
    // TODO: send welcome email
    // TODO: notify slack
    // TODO: update count
    .catch((err) => {
      console.log(err);
      return Boom.badImplementation();
    });
    return reply(promise);
  }
}
