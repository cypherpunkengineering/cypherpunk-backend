const Joi = require('joi');
const Boom = require('boom');
const bcrypt = require('bcrypt');

module.exports = {
  method: 'POST',
  path: '/register',
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

    // create user to save to db with confirmed = false
    let user = {
      email: request.payload.email,
      password: bcrypt.hashSync(request.payload.password, 15),
      confirmed: false
    };

    // save to db
    let promise = request.models.User.forge(user).save()
    .then((user) => {
      return new Promise((resolve, reject) => {
        // set session? cookie? I forget.
        request.server.app.cache.set('user:' + user.id, { account: user }, 0, (err) => {
          if (err) { return reject(err); }
          request.cookieAuth.set({ sid: 'user:' + user.id });
          return resolve();
        });
      });
    })
    .catch((err) => {
      console.log(err);
      return Boom.badImplementation();
    });
    return reply(promise);
  }
}
