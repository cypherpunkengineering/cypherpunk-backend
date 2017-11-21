const Joi = require('joi');
const Boom = require('boom');
const randToken = require('rand-token');

module.exports = {
  method: 'POST',
  path: '/api/v1/account/recover/email',
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

    // create recovery token
    user.recovery_token = randToken.generate(32);

    try {
      // update recovery token on this account
      await request.db('users')
        .update('recovery_token', user.recovery_token)
        .where({ id: user.id });

      // send email notification
      let msg = { to: user.email, id: user.id, recoveryToken: user.recovery_token };
      request.mailer.recovery(msg);

      // notify slack of new confirmation
      let text = `[RECOVER] User ${user.email} has requested account recovery by email`;
      request.slack.billing(text);

      // return a status 200
      return h.response().code(200);
    }
    catch (err) { return Boom.badImplementation(err); }
  }
};

async function getUser (request, h) {
  let email = request.payload.email;
  let columns = ['id', 'email'];

  try {
    let emails = await request.db.select(columns).from('users').where({ email: email });
    if (emails.length) { return emails[0]; }
    else { return Boom.badRequest('User Not Found'); }
  }
  catch (err) { return Boom.badImplementation(); }
}
