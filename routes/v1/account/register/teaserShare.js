const Joi = require('joi');
const Boom = require('boom');
const randToken = require('rand-token');

module.exports = {
  method: 'POST',
  path: '/api/v1/account/register/teaserShare',
  options: {
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
  handler: async (request, h) => {
    let referralId = request.auth.credentials.id;
    let referralName = request.payload.name || null;

    try {
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
      let result = await request.db.insert(user).into('users').returning('*');
      if (result.length) { user = result[0]; }
      else { return Boom.badRequest('Could not create user'); }

      // create radius tokens
      let username = request.radius.makeRandomString(26);
      let password = request.radius.makeRandomString(26);
      await request.radius.addToken(user.id, username, password);
      await request.radius.addTokenGroup(username, user.type);

      // send teaserShare email
      let msg = {
        to: user.email,
        id: user.id,
        recoveryToken: user.recoveryToken,
        referralId: referralId,
        referralName: referralName
      };
      await request.mailer.teaserShare(msg);

      // notify slack of new signup
      request.slack.billing(`[QUEUE] ${user.email} was given an invitation`);

      // update registered count
      await updateRegisteredCount(request.db);

      // print count to slack
      request.slack.count();

      // return status 200
      return h.response().code(200);
    }
    catch (err) { return Boom.badImplementation(err); }
  }
};

async function checkEmail (request, h) {
  let email = request.payload.email.toLowerCase();
  let result = await request.db.select('id').from('users').where({ email: email });
  if (result.length) { return Boom.badRequest('Email already in use'); }
  else { return true; }
}

async function updateRegisteredCount (db) {
  return db('user_counters').where({ type: 'registered' }).increment('count');
}
