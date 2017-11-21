const Joi = require('joi');
const Boom = require('boom');

module.exports = {
  method: 'POST',
  path: '/api/v1/account/confirm/email',
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

    // check if user is already confirmed
    if (user.confirmed) { return h.response().code(200); }

    // check that the confirmation key matches db value
    if (!user.confirmation_token) { return Boom.badImplementation('No Token Found'); }
    if (user.confirmation_token !== request.payload.confirmationToken) {
      return Boom.badRequest('Invalid Confirmation Token');
    }

    try {
      // update user account to confirmed
      let updatedUser = { confirmed: true, confirmation_token: null };
      await request.db('users').update(updatedUser).where({ id: user.id });

      // TODO: enable radius?

      // notify slack of new confirmation
      request.slack.billing(`[CONFIRM] User ${user.email} has been confirmed`);

      // update count
      await updateConfirmedCount(request.db);

      // print count to slack
      request.slack.count();

      // return status 200
      return h.response.code(200);
    }
    catch (err) { return Boom.badImplementation(err); }
  }
};

async function getUser (request, h) {
  let userId = request.payload.accountId;
  let columns = ['id', 'email', 'confirmed', 'confirmation_token'];
  let result = await request.db.select(columns).from('users').where({ id: userId });
  if (result.length) { return result[0]; }
  else { return Boom.badRequest('User Not Found'); }
}

async function updateConfirmedCount (db) {
  return db('user_counters').where({ type: 'confirmed' }).increment('count');
}
