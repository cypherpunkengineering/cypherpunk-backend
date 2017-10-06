const Joi = require('joi');
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
    .then(() => { return 'Unsubscribed!'; })
    .catch((e) => {
      console.log(e);

      // handle unique constraint error
      if (e.code === '23505') { return 'Unsubscribed!'; }

      if (e.isBoom) { return e; }
      else { return Boom.badImplementation(); }
    });

    return reply(promise);
  }
};
