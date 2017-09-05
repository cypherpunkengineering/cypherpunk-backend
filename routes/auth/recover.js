const Joi = require('joi');
const Boom = require('boom');
const randToken = require('rand-token');

module.exports = {
  method: 'POST',
  path: '/api/v1/account/recover/email',
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

    // create recovery token
    user.recovery_token = randToken.generate(32);

    // update recovery token on this account
    let promise = request.db('users').update('recovery_token', user.recovery_token)
    .then(() => {
      let msg = { to: user.email, id: user.id, recoveryToken: user.recovery_token };
      return request.mailer.recovery(msg);
    })
    // notify slack of new confirmation
    .then(() => {
      let text = `[RECOVER] User ${user.email} has requested account recovery by email :love_letter:`;
      request.slack.billing(text);
    })
    .catch((err) => { return Boom.badImplementation(err); });
    return reply(promise);
  }
}

function getUser(request, reply) {
  let email = request.payload.email;
  let columns = ['id', 'email'];
  let promise = request.db.select(columns).from('users').where({ email: email })
  .then((data) => {
    if (data.length) { return data[0]; }
    else { return Boom.badRequest('User Not Found'); }
  });
  return reply(promise);
}
