const Joi = require('joi');
const Boom = require('boom');
const bcrypt = require('bcrypt');
// dirty dirty password hack from old framework
const badPass = require('../../../../plugins/badpass');


module.exports = {
  method: 'POST',
  path: '/api/v1/account/authenticate/password',
  config: {
    auth: { strategy: 'session', mode: 'try' },
    validate: { payload: { password: Joi.string().min(6).required() } }
  },
  handler: (request, reply) => {
    if (request.auth.isAuthenticated) { return reply(); }

    let email = '';
    let cachedUser = request.state.cypherghost;
    let password = request.payload.password;

    // ensure cookie with email is set
    if (!cachedUser) { return reply(Boom.badRequest('Invalid Credentials')); }
    else { email = cachedUser.email; }

    let promise = request.db
    .select()
    .from('users')
    .where({ email: email, deactivated: false })
    .first()
    // check if dirty password is being used
    .then((user) => {
      if (!user.password.startsWith('$') && validateOldPassword(password, user.password)) {
        // update password to bcrypt version
        user.password = bcrypt.hashSync(password, 15);
        return request.db('users')
        .update({ password: user.password })
        .where({ id: user.id })
        .then(() => { return user; });
      }
      else { return user; }
    })
    // regular password validation
    .then((user) => {
      // validate password using bcrypt
      if (bcrypt.compareSync(password, user.password)) { return user; }
      else { return Promise.reject(Boom.badRequest('Invalid Credentials')); }
    })
    // create an authenticated session for this user
    .then((user) => {
      return new Promise((resolve, reject) => {
        let cachedUser = { id: user.id, email: user.email, type: user.type };
        request.server.app.cache.set('user:' + user.id, cachedUser, 0, (err) => {
          if (err) { return reject(err); }
          request.cookieAuth.set({ sid: 'user:' + user.id });
          return resolve();
        });
      });
    })
    .catch((err) => {
      console.log(err);
      if (err.isBoom) { return err; }
      else { return Boom.badImplementation(err.message); }
    });
    return reply(promise).unstate('cypherghost');
  }
};


function validateOldPassword(incomingPassword, oldPassword) {
  if (oldPassword === badPass.hash(incomingPassword)) { return true; }
  else { return false; }
}
