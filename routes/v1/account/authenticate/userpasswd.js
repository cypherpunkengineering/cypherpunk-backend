const Joi = require('joi');
const Boom = require('boom');
const bcrypt = require('bcrypt');

module.exports = {
  method: 'POST',
  path: '/api/v1/account/authenticate/userpasswd',
  config: {
    auth: { strategy: 'session', mode: 'try' },
    validate: {
      payload: {
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required()
      }
    }
  },
  handler: (request, reply) => {
    if (request.auth.isAuthenticated) { return reply.redirect('/'); }

    let email = request.payload.email.toLowerCase();
    let password = request.payload.password;
    let promise = request.db.select().from('users').where({ email: email }).first()
    .then((user) => {
      // validate password
      if (bcrypt.compareSync(password, user.password)) {
        return new Promise((resolve, reject) => {
          let cachedUser = { id: user.id, email: user.email };
          request.server.app.cache.set('user:' + user.id, cachedUser, 0, (err) => {
            if (err) { return reject(err); }
            request.cookieAuth.set({ sid: 'user:' + user.id });
            return resolve();
          });
        });
      }
      else { return Boom.badRequest('Invalid Credentials'); }
    })
    .catch((err) => { console.log(err); return err; });
    return reply(promise);
  }
};
