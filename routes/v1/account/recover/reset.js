const Joi = require('joi');
const Boom = require('boom');
const bcrypt = require('bcrypt');

module.exports = {
  method: 'POST',
  path: '/api/v1/account/recover/reset',
  options: {
    auth: false,
    validate: {
      payload: {
        accountId: Joi.string().required(),
        token: Joi.string().required(),
        password: Joi.string().required()
      }
    },
    // get user attached to this account id
    pre: [ { method: getUser, assign: 'user' } ]
  },
  handler: async (request, h) => {
    let user = request.pre.user;

    // check that the confirmation key matches db value
    if (!user.recovery_token) { return Boom.badRequest('Account not recoverable'); }
    if (user.recovery_token !== request.payload.token) { return Boom.badRequest('Invalid Token'); }

    // keep track of whether user was previously confirmed
    let previouslyConfirmed = user.confirmed;

    // update user's type to 'free' if currently 'invitation'
    let type = (user.type === 'invitation') ? 'free' : user.type;

    // delete recovery token
    try {
      // update user info
      await request.db('users')
        .update({
          type: type,
          confirmed: true,
          confirmation_token: null,
          recovery_token: null,
          password: bcrypt.hashSync(request.payload.password, 15)
        })
        .where({ id: user.id });

      // TODO: must update radius DB again because account might now be confirmed when it previously wasn't confirmed

      // notify slack of new account password
      let text = `[RECOVER] User ${user.email} has completed account recovery by email`;
      request.slack.billing(text);

      // if not previously confirmed, notify slack of new confirmation
      if (!previouslyConfirmed) {
        request.slack.billing(`[CONFIRM] User ${user.email} has been confirmed`);
      }

      // if not previously confirmed, update count
      if (!previouslyConfirmed) { await updateConfirmedCount(request.db); }

      // if not previously confirmed, print count to slack
      if (!previouslyConfirmed) { request.slack.count(); }

      // return status code 200
      return h.response().code(200);
    }
    catch (err) { return Boom.badImplementation(err); }
  }
};

async function getUser (request, h) {
  let userId = request.payload.accountId;
  let columns = ['id', 'email', 'confirmed', 'type', 'recovery_token'];

  let result = await request.db.select(columns).from('users').where({ id: userId });
  if (result.length) { return result[0]; }
  else { return Boom.badRequest('User Not Found'); }
}

async function updateConfirmedCount (db) {
  await db('user_counters').where({ type: 'confirmed' }).increment('count');
}
