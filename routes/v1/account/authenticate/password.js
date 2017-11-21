const Joi = require('joi');
const Boom = require('boom');
const bcrypt = require('bcrypt');
// dirty dirty password hack from old framework
const badPass = require('../../../../plugins/badpass');


module.exports = {
  method: 'POST',
  path: '/api/v1/account/authenticate/password',
  options: {
    auth: { strategy: 'session', mode: 'try' },
    validate: { payload: { password: Joi.string().min(6).required() } }
  },
  handler: async (request, h) => {
    if (request.auth.isAuthenticated) { return h.response().code(200); }

    let email = '';
    let cachedUser = request.state.cypherghost;
    let password = request.payload.password;

    // ensure cookie with email is set
    if (!cachedUser) { return Boom.badRequest('Invalid Credentials'); }
    else { email = cachedUser.email; }

    try {
      // get user from DB
      let user = await request.db
        .select().from('users')
        .where({ email: email, deactivated: false }).first();

      // check if dirty password is being used
      if (!user.password.startsWith('$') && validateOldPassword(password, user.password)) {
        // update password to bcrypt version
        user.password = bcrypt.hashSync(password, 15);
        await request.db('users').update({ password: user.password }).where({ id: user.id });
      }
      // regular password validation
      else if (!bcrypt.compareSync(password, user.password)) {
        return Boom.badRequest('Invalid Credentials');
      }

      // create an authenticated session for this user
      let cachedUser = { id: user.id, email: user.email, type: user.type };
      await request.server.app.cache.set('user:' + user.id, cachedUser, 0);
      request.cookieAuth.set({ sid: 'user:' + user.id });

      // build response data
      let response = await request.account.makeStatusResponse({ request, user });
      return h.response(response).unstate('cypherghost');
    }
    catch (err) { return Boom.badImplementation(err.message); }
  }
};


function validateOldPassword (incomingPassword, oldPassword) {
  if (oldPassword === badPass.hash(incomingPassword)) { return true; }
  else { return false; }
}
