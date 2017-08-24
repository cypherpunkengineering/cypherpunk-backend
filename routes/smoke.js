
const Joi = require('joi');

module.exports = {
  method: 'GET',
  path: '/smoke/{name}',
  config: {
    auth: false,
    validate: {
      params: { name: Joi.string().required() }
    }
  },
  handler: (request, reply) => {
    request.models.User.fetchAll()
    .then((users) => {
      return reply('test passed');
    });
  }
}
