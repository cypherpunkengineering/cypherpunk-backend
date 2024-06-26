const Joi = require('joi');
const Boom = require('boom');
const randToken = require('rand-token');

module.exports = {
  method: 'POST',
  path: '/api/v1/account/register/teaserShare',
  config: {
    auth: { strategy: 'session', mode: 'required' },
    validate: {
      payload: {
        name: Joi.string().optional(),
        email: Joi.string().email().required()
      }
    },
    // check if email already exists before handler
    pre: [ { method: checkEmail } ]
  },
  handler: (request, reply) => {
    let referralId = request.auth.credentials.id;
    let referralName = request.payload.name || null;

    // create user
    let user = {
      email: request.payload.email.toLowerCase(),
      secret: randToken.generate(32),
      type: 'invitation',
      priority: 1,
      confirmed: false,
      recovery_token: randToken.generate(32),
      referral_id: referralId,
      referral_name: referralName
    };
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
    // send teaserShare email
    .then(() => {
      let msg = {
        to: user.email,
        id: user.id,
        recoveryToken: user.recoveryToken,
        referralId: referralId,
        referralName: referralName
      };
      request.mailer.teaserShare(msg)
      .catch((e) => { console.log(e); });
    })
    // notify slack of new signup
    .then(() => {
      let text = `[QUEUE] ${user.email} was given an invitation :highfive:`;
      request.slack.billing(text);
    })
    // update count
    .then(() => { return updateRegisteredCount(request.db); })
    // print count to slack
    .then(() => { request.slack.count(); })
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
  });
  return reply(promise);
}

function updateRegisteredCount(db) {
  return db('user_counters').where({ type: 'registered' }).increment('count');
}
