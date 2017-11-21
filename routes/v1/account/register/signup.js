const Joi = require('joi');
const Boom = require('boom');
const bcrypt = require('bcrypt');
const randToken = require('rand-token');

module.exports = {
  method: 'POST',
  path: '/api/v1/account/register/signup',
  options: {
    auth: { strategy: 'session', mode: 'try' },
    validate: {
      payload: {
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required(),
        billing: Joi.boolean().optional()
      }
    },
    // check if email already exists before handler
    pre: [ { method: checkEmail, assign: 'user' } ]
  },
  handler: async (request, h) => {
    // functional scoped variables
    let radius;
    let user = request.pre.user;
    let email = request.payload.email;
    let password = request.payload.password;

    try {
      // create user
      user = await createUser(email, password, request);

      // create radius tokens
      radius = await createRadius(user, request);

      // create session and cookie for user
      await createSession(user, request);

      // send welcome email
      if (!request.payload.billing) {
        let msg = { to: user.email, id: user.id, confirmationToken: user.confirmation_token };
        await request.mailer.registration(msg);
      }

      // notify slack of new signup
      request.slack.billing(`[SIGNUP] ${user.email} has signed up for an account`);

      // update count
      await updateRegisteredCount(request.db);

      // print count to slack
      request.slack.count();

      // create account status
      let userInfo = { request, user, subscription: {}, radius };
      let response = await request.account.makeStatusResponse(userInfo);
      return h.response(response).unstate('cypherghost');
    }
    catch (err) { return Boom.badImplementation(err); }
  }
};

async function createUser (email, password, request) {
  return request.db.insert({
    email: email.toLowerCase(),
    password: bcrypt.hashSync(password, 15),
    secret: randToken.generate(32),
    type: 'free',
    priority: 1,
    confirmed: false,
    confirmation_token: randToken.generate(32)
  }).into('users').returning('*')
    .then((data) => {
      if (data.length) { return data[0]; }
      else { throw new Error('Could not create user'); }
    });
}

async function createRadius (user, request) {
  let username = request.radius.makeRandomString(26);
  let password = request.radius.makeRandomString(26);
  return request.radius.addToken(user.id, username, password)
    .then(() => { return request.radius.addTokenGroup(username, user.type); })
    .then(() => {
      return request.db.select('username', 'value')
        .from('radius_tokens')
        .where({ account: user.id });
    })
    .then((data) => {
      if (data.length) { return data[0]; }
      else { throw Boom.badRequest('Invalid Radius Account'); }
    });
}

async function createSession (user, request) {
  // set session? cookie? I forget.
  let cachedUser = { id: user.id, email: user.email.toLowerCase(), type: user.type };
  await request.server.app.cache.set('user:' + user.id, cachedUser, 0);
  return request.cookieAuth.set({ sid: 'user:' + user.id });
}

async function updateRegisteredCount (db) {
  return db('user_counters').where({ type: 'registered' }).increment('count');
}


// Pre Methods:

async function checkEmail (request, h) {
  let email = request.payload.email.toLowerCase();

  try {
    let user = await request.db.select().from('users').where({ email: email }).first();
    if (user) { return Boom.badRequest('Email already in use'); }
    else { return {}; }
  }
  catch (err) { return Boom.badImplementation(err); }
}
