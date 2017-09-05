const Joi = require('joi');
const Boom = require('boom');

module.exports = {
  method: 'POST',
  path: '/api/v1/account/change/email',
  config: {
    auth: false,
    validate: { payload: { email: Joi.string().email().required() } },
    pre: [ { method: getUser, assign: 'user' } ]
  },
  handler: (request, reply) => {
    let user = request.pre.user;
    if (user.id) { return reply({ code: 200 }); }
    else { return reply(Boom.unauthorized('Email Not Found')); }
  }
};

function getUser(request, reply) {
  let email = request.payload.email;
  let promise = request.db.select('id').from('users').where({ email: email })
  .then((data) => {
    if (data.length) { return data[0]; }
    else { return Boom.unauthorized('Email Not Found'); }
  });
  return reply(promise);
}
