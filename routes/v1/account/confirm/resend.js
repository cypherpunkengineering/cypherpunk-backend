const Joi = require('joi');
const Boom = require('boom');

module.exports = {
  method: 'POST',
  path: '/api/v1/account/confirm/resend',
  options: {
    auth: false,
    validate: {
      payload: { email: Joi.string().email().required() }
    },
    // get email attached to this email
    pre: [ { method: getUser, assign: 'user' } ]
  },
  handler: async (request, h) => {
    let user = request.pre.user;

    // check if user is already confirmed
    if (user.confirmed) { return Boom.badRequest('User Already Confirmed'); }

    // check that the confirmation key matches db value
    if (!user.confirmation_token) { return Boom.badImplementation('No Token Found'); }

    try {
      // re-send welcome email
      let msg = { to: user.email, id: user.id, confirmationToken: user.confirmation_token };
      await request.mailer.registration(msg);

      // notify slack of new confirmation
      let text = `[RESEND] User ${user.email} has requested re-send of confirmation email`;
      request.slack.billing(text);
    }
    catch (err) { return Boom.badImplementation(err); }
  }
};

async function getUser (request, h) {
  let email = request.payload.email;
  let columns = ['id', 'email', 'confirmed', 'confirmation_token'];
  let result = await request.db.select(columns).from('users').where({ email: email });
  if (result.length) { return result[0]; }
  else { return Boom.badRequest('User Not Found'); }
}
