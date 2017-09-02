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
    let user = {
      email: request.payload.email.toLowerCase(),
      password: bcrypt.hashSync(request.payload.password, 15),
      secret: randToken.generate(32),
      type: 'free',
      priority: 1,
      confirmed: false,
      confirmation_token: randToken.generate(32),
      privacy_username: randToken.generate(32),
      privacy_password: randToken.generate(32)
    };
    let promise = request.db.insert(user).into('users').returning('*')
    // create subscription
    .then((data) => {
      user = data[0];
      let subscription = { user_id: user.id, current: true };
      return request.db.insert(subscription).into('subscriptions').returning('*');
    })
    // create session and cookie for user
    .then(() => {
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
    // send welcome email
    .then(() => {
      let msg = { to: user.email, id: user.id, confirmationToken: user.confirmation_token };
      request.mailer.registration(msg);
    })
    // notify slack of new signup
    .then(() => {
      let text = `[SIGNUP] ${user.email} has signed up for an account :highfive:`;
      request.slack.billing(text);
    })
    // update count
    .then(() => { return updateRegisteredCount(request.db); })
    // print count to slack
    .then(() => { request.slack.count(); })
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

function updateRegisteredCount(db) {
  return db('user_counters').where({ type: 'registered' }).increment('count');
}
