const Joi = require('joi');
const Boom = require('boom');
const bcrypt = require('bcrypt');
// dirty dirty password hack from old framework
const badPass = require('../../../../plugins/badpass');


module.exports = {
  method: 'POST',
  path: '/api/v1/account/authenticate/userpasswd',
  options: {
    auth: { strategy: 'session', mode: 'try' },
    validate: {
      payload: {
        login: Joi.string().email().required(),
        password: Joi.string().min(6).required()
      }
    }
  },
  handler: async (request, h) => {
    if (request.auth.isAuthenticated) { return h.response().code(200); }

    let email = request.payload.login.toLowerCase();
    let password = request.payload.password;

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
      // validate password using bcrypt
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
    catch (err) { return Boom.badImplementation(err); }
  }
};


function validateOldPassword (incomingPassword, oldPassword) {
  if (oldPassword === badPass.hash(incomingPassword)) { return true; }
  else { return false; }
}
