const Joi = require('Joi');
const Boom = require('boom');

module.exports = {
  method: 'GET',
  path: '/api/v1/emails/unsubscribe',
  config: {
    auth: false,
    validate: {
      query: {
        email: Joi.string().required()
      }
    }
  },
  handler: (request, reply) => {
    let email = request.query.email;

    let promise = request.db('unsubscribe_list').insert({ email: email })
    .then(() => { return; })
    .catch((e) => {
      console.log(e);
      if (e.isBoom) { return e; }
      else { return Boom.badImplementation(); }
    });

    return reply(promise);
  }
};
