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
    },
    // check if email already exists before handler
    pre: [ { method: checkEmail } ]
  },
  handler: (request, reply) => {
    if (request.auth.isAuthenticated) { return reply.redirect('/'); }

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
    // create subscription
    .then((user) => {
      user = user[0];
      return request.db.insert({ user_id: user.id, current: true }).into('subscriptions')
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
      })
      .then(() => { return user; });
    })
    // TODO: update radius
    // TODO: send welcome email
    // notify slack
    .then((user) => {
      let text = `[SIGNUP] ${user.email} has signed up for an account :highfive:`;
      request.slack.billing(text);
    })
    // update count
    .then(() => { return updateRegisteredCount(request); })
    // print count to slack
    .catch((err) => { return Boom.badImplementation(err); });
    return reply(promise);
  }
}

function checkEmail(request, reply) {
  let email = request.payload.email.toLowerCase();
  let promise = request.db.select('id').from('users').where({ email: email })
  .then((data) => {
    if (data.length) { return Boom.badRequest('Email already in use'); }
    else { return; }
  });
  return reply(promise);
}

function updateRegisteredCount(request) {
  return request.db('user_counters').where({ type: 'registered' }).increment('count');
}
