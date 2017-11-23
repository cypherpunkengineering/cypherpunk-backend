const Boom = require('boom');

module.exports = {
  method: 'GET',
  path: '/api/v1/account/status',
  options: { auth: { mode: 'required' } },
  handler: async (request, h) => {
    try {
      // build response data
      let userId = request.auth.credentials.id;
      return await request.account.makeStatusResponse({ request, userId });
    }
    catch (err) {
      console.log(err);
      return Boom.badRequest('Invalid User: ', err);
    }
  }
};
