const Boom = require('boom');

module.exports = {
  method: 'POST',
  path: '/api/v1/account/logout',
  options: {
    auth: { strategy: 'session', mode: 'try' }
  },
  handler: async (request, h) => {
    if (!request.auth.isAuthenticated) { return h.response().code(200); }

    // delete cookie on client side
    request.cookieAuth.clear();

    // delete session in cache
    try {
      let user = request.auth.credentials;
      await request.server.app.cache.drop('user:' + user.id);
      return h.response().code(200);
    }
    catch (err) { return Boom.badImplementation('Cache Error'); }
  }
};
