const Boom = require('boom');

module.exports = {
  method: 'GET',
  path: '/api/v1/account/status',
  config: { auth: { mode: 'required' } },
  handler: (request, reply) => {
    let userId = request.auth.credentials.id;
    let promise = request.account.makeStatusResponse({ request, userId })
    .catch(err => Boom.badRequest('Invalid User'));
    return reply(promise);
  }
};
