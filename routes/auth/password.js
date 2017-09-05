const Joi = require('joi');
const Boom = require('boom');
const bcrypt = require('bcrypt');

module.exports = {
  method: 'POST',
  path: '/api/v1/account/change/password',
  config: {
    auth: { strategy: 'session', mode: 'required' },
    validate: {
      payload: {
        passwordOld: Joi.string().required(),
        passwordNew: Joi.string().required()
      }
    },
    // get user attached to this account id
    pre: [ { method: currentUser, assign: 'user' } ]
  },
  handler: (request, reply) => {
    let user = request.pre.user;

    // if password field is currently empty return 500
    if (!user.password) { return reply(Boom.badImplementation('Missing password from DB')); }

    // check old password
    let oldPasswordValid = bcrypt.compareSync(request.payload.passwordOld, user.password);
    if (!oldPasswordValid) { return reply(Boom.unauthorized('Invalid Credentials')); }

    // update user account with new password
    let newPassword = bcrypt.hashSync(request.payload.passwordNew, 15);
    let promise = request.db('users').update({ password: newPassword }).where({ id : user.id })
    .then(() => { return; }) // return only status 200
    .catch((err) => { return Boom.badImplementation(err); });
    return reply(promise);
  }
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
