const Joi = require('joi');
const Boom = require('boom');
const bcrypt = require('bcrypt');

module.exports = {
  method: 'POST',
  path: '/login',
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

    let email = request.payload.email;
    let password = request.payload.password;
    let promise = request.models.User.where({ email: email }).fetch()
    .then((user) => {
      // validate password
      if (bcrypt.compareSync(password, user.get('password'))) {
        return new Promise((resolve, reject) => {
          let cachedUser = {
            id: user.get('id'),
            email: user.get('email'),
            created_at: user.get('created_at'),
            updated_at: user.get('updated_at')
          };
          request.server.app.cache.set('user:' + user.id, cachedUser, 0, (err) => {
            if (err) { return reject(err); }
            request.cookieAuth.set({ sid: 'user:' + user.id });
            return resolve();
          });
        });
      }
      else { return Boom.badRequest('Invalid Credentials'); }
    })
    .catch((err) => { return err; });
    return reply(promise);
  }
}
