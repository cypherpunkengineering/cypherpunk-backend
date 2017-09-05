const Joi = require('joi');
const Boom = require('boom');

module.exports = {
  method: 'POST',
  path: '/api/v1/account/confirm/emailChange',
  config: {
    auth: false,
    validate: {
      payload: {
        accountId: Joi.string().required(),
        confirmationToken: Joi.string().required()
      }
    },
    // get user attached to this account id
    pre: [ { method: getUser, assign: 'user' } ]
  },
  handler: (request, reply) => {
    let user = request.pre.user;

    // ensure pending_email and pending_email_confirmation_token exists
    if (!user.pending_email || !user.pending_email_confirmation_token) {
      return reply(Boom.badRequest('Account has not requested an email change'));
    }

    if (user.pending_email_confirmation_token !== request.payload.confirmationToken) {
      return reply(Boom.badRequest('Invalid Token'));
    }

    // check to see if user was previously confirmed
    let previousEmail = user.email;
    let previouslyConfirmed = user.confirmed;

    // update user account to confirmed
    let promise = request.db('users').update({
      confirmed: true,
      email: user.pending_email,
      pending_email: null,
      pending_email_confirmation_token: null
    }).where({ id: user.id })
    // TODO: enable radius?
    // notify slack of new confirmation
    .then(() => {
      let text = `[CHANGE] User email change from ${previousEmail} to ${user.pending_email} has been confirmed :sunglasses:`;
      request.slack.billing(text);
    })
    // if not previously confirmed, notify slack of new confirmation
    .then(() => {
      if (!previouslyConfirmed) {
        request.slack.billing(`[CONFIRM] User ${user.email} has been confirmed :sunglasses:`);
      }
    })
    // if not previously confirmed, update confirmation count
    .then(() => {
      if (!previouslyConfirmed) { return updateConfirmedCount(request.db); }
    })
    // if not previously confirmed, print count to slack
    .then(() => {
      if (!previouslyConfirmed) { request.slack.count(); }
    })
    // TODO: update stripe with new email
    .catch((err) => { return Boom.badImplementation(err); });
    return reply(promise);
  }
};

function getUser(request, reply) {
  let userId = request.payload.accountId;
  let columns = ['id', 'email', 'confirmed', 'pending_email', 'pending_email_confirmation_token'];
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
