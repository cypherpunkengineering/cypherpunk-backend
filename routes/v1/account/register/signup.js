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
        password: Joi.string().min(6).required(),
        billing: Joi.boolean().optional(),
      }
    },
    // check if email already exists before handler
    pre: [ { method: checkEmail } ]
  },
  handler: (request, reply) => {
    if (request.auth.isAuthenticated) { return reply.redirect('/'); }

    // create user
    let sub = {}, radius, user = {
      email: request.payload.email.toLowerCase(),
      password: bcrypt.hashSync(request.payload.password, 15),
      secret: randToken.generate(32),
      type: 'free',
      priority: 1,
      confirmed: false,
      confirmation_token: randToken.generate(32)
    };
    // TODO: flag user somehow if registered in billing mode (instead of registration email, send combined payment success + registration email, or send a trial email if no payment is received within a timeout)

    let promise = request.db.insert(user).into('users').returning('*')
    .then((data) => {
      if (data.length) { user = data[0]; }
      else { throw new Error('Could not create user'); }
    })
    // create radius tokens
    .then(() => {
      let username = request.radius.makeRandomString(26),
          password = request.radius.makeRandomString(26);
      return request.radius.addToken(user.id, username, password)
      .then(() => { return request.radius.addTokenGroup(username, user.type); });
    })
    // create session and cookie for user
    .then(() => {
      return new Promise((resolve, reject) => {
        // set session? cookie? I forget.
        let cachedUser = { id: user.id, email: user.email.toLowerCase(), type: user.type };
        request.server.app.cache.set('user:' + user.id, cachedUser, 0, (err) => {
          if (err) { return reject(err); }
          request.cookieAuth.set({ sid: 'user:' + user.id });
          return resolve();
        });
      });
    })
    // send welcome email (unless we're in billing registration mode)
    .then(() => {
      if (!request.payload.billing) {
        let msg = { to: user.email, id: user.id, confirmationToken: user.confirmation_token };
        return request.mailer.registration(msg); // TODO catch and print?
      }
    })
    // notify slack of new signup
    .then(() => {
      let text = `[SIGNUP] ${user.email} has signed up for an account :highfive:`;
      request.slack.billing(text); // TODO catch and print?
    })
    // update count
    .then(() => { return updateRegisteredCount(request.db); })
    // print count to slack
    .then(() => { request.slack.count(); }) // TODO catch and print?
    // get radius data
    .then(() => {
      return request.db.select('username', 'value').from('radius_tokens').where({ account: user.id })
      .then((data) => {
        if (data.length) { radius = data[0]; }
        else { throw Boom.badRequest('Invalid Radius Account'); }
      });
    })
    .then(() => {
      return request.account.makeStatusResponse({ request, user, subscription: sub, radius });
    })
    .catch((err) => { return Boom.badImplementation(err); });
    return reply(promise);
  }
};

function checkEmail(request, reply) {
  let email = request.payload.email.toLowerCase();
  let promise = request.db.select('id').from('users').where({ email: email })
  .then((data) => {
    if (data.length) { return Boom.badRequest('Email already in use'); }
    else { return; }
  })
  .catch((err) => { console.error(err); return Boom.badImplementation(err); });
  return reply(promise);
}

function updateRegisteredCount(db) {
  return db('user_counters').where({ type: 'registered' }).increment('count');
}
