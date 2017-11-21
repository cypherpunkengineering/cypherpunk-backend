const Joi = require('joi');
const Boom = require('boom');

module.exports = {
  method: 'POST',
  path: '/api/v1/account/confirm/emailChange',
  options: {
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
  handler: async (request, h) => {
    let user = request.pre.user;

    // ensure pending_email and pending_email_confirmation_token exists
    if (!user.pending_email || !user.pending_email_confirmation_token) {
      return Boom.badRequest('Account has not requested an email change');
    }

    if (user.pending_email_confirmation_token !== request.payload.confirmationToken) {
      return Boom.badRequest('Invalid Token');
    }

    // check to see if user was previously confirmed
    let previousEmail = user.email;
    let previouslyConfirmed = user.confirmed;

    try {
      // update user account to confirmed
      let updatedUser = {
        confirmed: true,
        email: user.pending_email,
        pending_email: null,
        pending_email_confirmation_token: null
      };
      await request.db('users').update(updatedUser).where({ id: user.id });

      // TODO: enable radius?

      // notify slack of new confirmation
      let text = `[CHANGE] User email change from ${previousEmail} to ${user.pending_email} has been confirmed`;
      request.slack.billing(text);

      // if not previously confirmed, notify slack of new confirmation
      if (!previouslyConfirmed) {
        request.slack.billing(`[CONFIRM] User ${user.email} has been confirmed`);
      }

      // if not previously confirmed, update confirmation count
      if (!previouslyConfirmed) { return updateConfirmedCount(request.db); }

      // if not previously confirmed, print count to slack
      if (!previouslyConfirmed) { request.slack.count(); }

      // TODO: update stripe with new email

      // return status 200
      return h.response().code(200);
    }
    catch (err) { return Boom.badImplementation(err); }
  }
};

async function getUser (request, h) {
  let userId = request.payload.accountId;
  let columns = ['id', 'email', 'confirmed', 'pending_email', 'pending_email_confirmation_token'];
  let result = await request.db.select(columns).from('users').where({ id: userId });
  if (result.length) { return result[0]; }
  else { return Boom.badRequest('User Not Found'); }
}

async function updateConfirmedCount (db) {
  return db('user_counters').where({ type: 'confirmed' }).increment('count');
}
