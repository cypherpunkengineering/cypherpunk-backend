const Joi = require('joi');
const Boom = require('boom');
const bcrypt = require('bcrypt');
// dirty dirty password hack from old framework
const badPass = require('../../../../plugins/badpass');


module.exports = {
  method: 'POST',
  path: '/api/v1/account/authenticate/userpasswd',
  config: {
    auth: { strategy: 'session', mode: 'try' },
    validate: {
      payload: {
        login: Joi.string().email().required(),
        password: Joi.string().min(6).required()
      }
    }
  },
  handler: (request, reply) => {
    if (request.auth.isAuthenticated) { return reply(); }

    let currentUser, sub, radius;
    let email = request.payload.login.toLowerCase();
    let password = request.payload.password;
    let subColumns = [
      'active',
      'renewal_timestamp',
      'expiration_timestamp',
      'type'
    ];

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
      else { return Promise.reject(Boom.forbidden('Invalid Credentials')); }
    })
    // create an authenticated session for this user
    .then((user) => {
      return new Promise((resolve, reject) => {
        let cachedUser = { id: user.id, email: user.email, type: user.type };
        request.server.app.cache.set('user:' + user.id, cachedUser, 0, (err) => {
          if (err) { return reject(err); }
          request.cookieAuth.set({ sid: 'user:' + user.id });
          return resolve(user);
        });
      });
    })
    // build response data
    .then((user) => { currentUser = user; })
    // get user subscription data
    .then(() => {
      return request.db.select(subColumns).from('subscriptions').where({ user_id: currentUser.id })
      .then((data) => { if (data.length) { sub = data[0]; } });
    })
    // get radius data
    .then(() => {
      return request.db.select('username', 'value').from('radius_tokens').where({ account: currentUser.id })
      .then((data) => {
        if (data.length) { radius = data[0]; }
        else { throw Boom.badRequest('Invalid Radius Account'); }
      });
    })
    .then(() => {
      return {
        secret: currentUser.secret || '',
        privacy: {
          username: radius.username,
          password: radius.value
        },
        account: {
          id: currentUser.id,
          email: currentUser.email,
          type: currentUser.type,
          confirmed: currentUser.confirmed || false,
        },
        subscription: {
          active: sub.active || false,
          renews: sub.renewal_timestamp ? true : false,
          type: sub.type || 'preview',
          expiration: sub.expiration_timestamp || 0
        }
      };
    })
    .catch((err) => {
      console.log(err);
      if (err.isBoom) { return err; }
      else { return Boom.badImplementation(err.message); }
    });
    return reply(promise);
  }
};


function validateOldPassword(incomingPassword, oldPassword) {
  if (oldPassword === badPass.hash(incomingPassword)) { return true; }
  else { return false; }
}
