const Joi = require('joi');
const Boom = require('boom');

module.exports = {
  method: 'POST',
  path: '/api/v1/account/identify/email',
  options: {
    auth: false,
    validate: { payload: { email: Joi.string().email().required() } },
    pre: [ { method: getUser, assign: 'user' } ]
  },
  handler: async (request, h) => {
    let user = request.pre.user;
    if (user && user.email) {
      // create temp cookie for later use
      return h.response().code(200).state('cypherghost', { email: user.email });
    }
    else { return Boom.unauthorized('Email Not Found'); }
  }
};

async function getUser (request, h) {
  let email = request.payload.email;
  let result = await request.db.select(['id', 'email']).from('users').where({ email: email });
  if (result.length) { return result[0]; }
  else { return Boom.unauthorized('Email Not Found'); }
}
