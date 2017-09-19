const Joi = require('joi');
const Boom = require('boom');

module.exports = {
  method: 'POST',
  path: '/api/v1/account/confirm/email',
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

    // check if user is already confirmed
    if (user.confirmed) { return reply(); }

    // check that the confirmation key matches db value
    if (!user.confirmation_token) { return reply(Boom.badImplementation('No Token Found')); }
    if (user.confirmation_token !== request.payload.confirmationToken) {
      return reply(Boom.badRequest('Invalid Confirmation Token'));
    }

    // update user account to confirmed
    let promise = request.db('users').update({
      confirmed: true,
      confirmation_token: null
    }).where({ id: user.id })
    // TODO: enable radius?
    // notify slack of new confirmation
    .then(() => {
      let text = `[CONFIRM] User ${user.email} has been confirmed :sunglasses:`;
      request.slack.billing(text); // TODO catch and print?
    })
    // update count
    .then(() => { return updateConfirmedCount(request.db); })
    // print count to slack
    .then(() => { request.slack.count(); }) // TODO catch and print?
    .catch((err) => { return Boom.badImplementation(err); });
    return reply(promise);
  }
};

function getUser(request, reply) {
  let userId = request.payload.accountId;
  let columns = ['id', 'email', 'confirmed', 'confirmation_token'];
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
