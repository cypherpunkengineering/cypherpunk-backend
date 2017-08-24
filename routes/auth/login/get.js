const Joi = require('joi');

module.exports = {
  method: 'GET',
  path: '/login',
  config: {
    auth: { strategy: 'session', mode: 'try' }
    // auth: { strategy: 'session', mode: 'try' },
  },
  handler: (request, reply) => {
    return reply.file('./login.html');
  }
}
