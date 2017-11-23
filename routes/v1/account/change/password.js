const Joi = require('joi');
const Boom = require('boom');
const bcrypt = require('bcrypt');

module.exports = {
  method: 'POST',
  path: '/api/v1/account/change/password',
  options: {
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
  handler: async (request, h) => {
    let user = request.pre.user;

    // if password field is currently empty return 500
    if (!user.password) { return Boom.badImplementation('Missing password from DB'); }

    // check old password
    let oldPasswordValid = bcrypt.compareSync(request.payload.passwordOld, user.password);
    if (!oldPasswordValid) { return Boom.unauthorized('Invalid Credentials'); }

    try {
      // hash new password
      let newPassword = bcrypt.hashSync(request.payload.passwordNew, 15);
      // update user account with new password
      await request.db('users').update({ password: newPassword }).where({ id: user.id });
      // return status 200
      return h.response().code(200);
    }
    catch (err) { return Boom.badImplementation(err); }
  }
};

async function currentUser (request, h) {
  let id = request.auth.credentials.id;
  let result = await request.db.select(['id', 'password']).from('users').where({ id: id });
  if (result.length) { return result[0]; }
  else { return Boom.unauthorized(); }
}
