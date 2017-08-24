const Joi = require('joi');

module.exports = {
  method: 'GET',
  path: '/secret',
  config: {
    auth: { mode: 'required' }
  },
  handler: (request, reply) => {
    return reply('This is a secret');
  }
}
