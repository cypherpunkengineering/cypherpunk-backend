const Joi = require('joi');
const Boom = require('boom');

module.exports = {
  method: 'GET',
  path: '/register',
  config: {
    auth: { strategy: 'session', mode: 'try' },
  },
  handler: (request, reply) => {
    return reply.file('./register.html');
  }
}
