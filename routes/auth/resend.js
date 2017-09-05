const Joi = require('joi');
const Boom = require('boom');
const bcrypt = require('bcrypt');
const randToken = require('rand-token');

module.exports = {
  method: 'POST',
  path: '/api/v1/account/confirm/resend',
  config: {
    auth: false,
    validate: {
      payload: { email: Joi.string().email().required() }
    },
    // get email attached to this email
    pre: [ { method: getUser, assign: 'user' } ]
  },
  handler: (request, reply) => {
    let user = request.pre.user;

    // check if user is already confirmed
    if (user.confirmed) { return reply(Boom.badRequest('User Already Confirmed')); }

    // check that the confirmation key matches db value
    if (!user.confirmation_token) { return reply(Boom.badImplementation('No Token Found')); }

    // re-send welcome email
    let msg = { to: user.email, id: user.id, confirmationToken: user.confirmation_token };
    let promise = request.mailer.registration(msg)
    // notify slack of new confirmation
    .then(() => {
      let text = `[RESEND] User ${user.email} has requested re-send of confirmation email :love_letter:`;
      request.slack.billing(text);
    })
    .catch((err) => { return Boom.badImplementation(err); });
    return reply(promise);
  }
}

function getUser(request, reply) {
  let email = request.payload.email;
  let columns = ['id', 'email', 'confirmed', 'confirmation_token'];
  let promise = request.db.select(columns).from('users').where({ email: email })
  .then((data) => {
    if (data.length) { return data[0]; }
    else { return Boom.badRequest('User Not Found'); }
  });
  return reply(promise);
}
