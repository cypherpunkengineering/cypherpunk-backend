const Joi = require('joi');
const Boom = require('boom');
const bcrypt = require('bcrypt');
const randToken = require('rand-token');

module.exports = {
  method: 'POST',
  path: '/api/v1/account/change/email',
  config: {
    auth: { strategy: 'session', mode: 'required' },
    validate: {
      payload: {
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required()
      }
    },
    pre: [
      { method: checkPendingEmails }, // check if email already exists before handler
      { method: currentUser, assign: 'user' } // get current user
    ]
  },
  handler: (request, reply) => {
    let user = request.pre.user;

    // check if password is value
    let passwordValid = bcrypt.compareSync(request.payload.password, user.password);
    if (!passwordValid) { return reply(Boom.badRequest('Invalid Credentials')); }

    // create pending_email & pending_email_confirmation_token
    user.pending_email = request.payload.email.toLowerCase();
    user.pendingToken = randToken.generate(32);

    // update db with new values
    let promise = request.db('users').update({
      pending_email: user.pending_email,
      pending_email_confirmation_token: user.pendingToken
    }).where({ id: user.id })
    // send change email ... err ...  email
    .then(() => {
      let msg = { to: user.pending_email, id: user.id, pendingEmailToken: user.pendingToken };
      request.mailer.changeEmail(msg); // TODO catch and print?
    })
    .catch((err) => {
      console.log(err);
      if (err.isBoom) { return err; }
      else { return Boom.badImplementation(err); }
    });
    return reply(promise);
  }
};

function checkPendingEmails(request, reply) {
  let email = request.payload.email.toLowerCase();
  let promise = request.db
  .select(['id'])
  .from('users')
  .where({ email: email })
  .orWhere({ pending_email: email })
  .then((data) => {
    if (data.length) { return Boom.badRequest('Email already in use'); }
  });
  return reply(promise);
}

function currentUser(request, reply) {
  let id = request.auth.credentials.id;
  let promise = request.db.select(['id', 'password']).from('users').where({ id: id })
  .then((data) => {
    if (data.length) { return data[0]; }
    else { return Boom.unauthorized(); }
  });
  return reply(promise);
}
