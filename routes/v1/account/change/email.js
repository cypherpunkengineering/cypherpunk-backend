const Joi = require('joi');
const Boom = require('boom');
const bcrypt = require('bcrypt');
const randToken = require('rand-token');

module.exports = {
  method: 'POST',
  path: '/api/v1/account/change/email',
  options: {
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
  handler: async (request, h) => {
    let user = request.pre.user;

    // check if password is value
    let passwordValid = bcrypt.compareSync(request.payload.password, user.password);
    if (!passwordValid) { return Boom.badRequest('Invalid Credentials'); }

    // create pending_email & pending_email_confirmation_token
    user.pending_email = request.payload.email.toLowerCase();
    user.pendingToken = randToken.generate(32);

    // update db with new values
    try {
      let updatedUser = {
        pending_email: user.pending_email,
        pending_email_confirmation_token: user.pendingToken
      };
      await request.db('users').update(updatedUser).where({ id: user.id });

      // send email change ... err ... email
      let msg = { to: user.pending_email, id: user.id, pendingEmailToken: user.pendingToken };
      await request.mailer.changeEmail(msg);

      // return status 200
      return h.response().code(200);
    }
    catch (err) { return Boom.badImplementation(err); }
  }
};

async function checkPendingEmails (request, h) {
  let email = request.payload.email.toLowerCase();
  let result = await request.db.select(['id']).from('users')
    .where({ email: email }).orWhere({ pending_email: email });
  if (result.length) { return Boom.badRequest('Email already in use'); }
  else { return true; }
}

async function currentUser (request, h) {
  let id = request.auth.credentials.id;
  let result = await request.db.select(['id', 'password']).from('users').where({ id: id });
  if (result.length) { return result[0]; }
  else { return Boom.unauthorized(); }
}
