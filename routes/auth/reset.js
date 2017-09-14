const Joi = require('joi');
const Boom = require('boom');
const bcrypt = require('bcrypt');

module.exports = {
  method: 'POST',
  path: '/api/v1/account/recover/reset',
  config: {
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
  handler: (request, reply) => {
    let user = request.pre.user;

    // check that the confirmation key matches db value
    if (!user.recovery_token) { return reply(Boom.badRequest('Account not recoverable')); }
    if (user.recovery_token !== request.payload.token) {
      return reply(Boom.badRequest('Invalid Token'));
    }

    // keep track of whether user was previously confirmed
    let previouslyConfirmed = user.confirmed;

    // update user's type to 'free' if currently 'invitation'
    let type = (user.type === 'invitation') ? 'free' : user.type;

    // delete recovery token
    let promise = request.db('users').update({
      type: type,
      confirmed: true,
      confirmation_token: null,
      recovery_token: null,
      password: bcrypt.hashSync(request.payload.password, 15)
    })
    .where({ id: user.id })
    // TODO: must update radius DB again because account might now be confirmed when it previously wasn't confirmed
    // notify slack of new account password
    .then(() => {
      let text = `[RECOVER] User ${user.email} has completed account recovery by email :+1:`;
      request.slack.billing(text); // TODO catch and print?
    })
    // if not previously confirmed, notify slack of new confirmation
    .then(() => {
      if (!previouslyConfirmed) {
        // TODO catch and print?
        request.slack.billing(`[CONFIRM] User ${user.email} has been confirmed :sunglasses:`);
      }
    })
    // if not previously confirmed, update count
    .then(() => {
      if (!previouslyConfirmed) { return updateConfirmedCount(request.db); }
    })
    // if not previously confirmed, print count to slack
    .then(() => {
      if (!previouslyConfirmed) { request.slack.count(); } // TODO catch and print?
    })
    .catch((err) => { return Boom.badImplementation(err); });
    return reply(promise);
  }
};

function getUser(request, reply) {
  let userId = request.payload.accountId;
  let columns = ['id', 'email', 'confirmed', 'type', 'recovery_token'];
  let promise = request.db.select(columns).from('users').where({ id: userId })
  .then((data) => {
    if (data.length) { return data[0]; }
    else { return Boom.badRequest('User Not Found'); }
  });
  return reply(promise);
}

function updateConfirmedCount(db) {
  return db('user_counters').where({ type: 'confirmed' }).increment('count');
}
