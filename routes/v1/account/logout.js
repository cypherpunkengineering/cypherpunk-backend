const Boom = require('boom');

module.exports = {
  method: 'POST',
  path: '/api/v1/account/logout',
  config: {
    auth: { strategy: 'session', mode: 'try' }
  },
  handler: (request, reply) => {
    if (request.auth.isAuthenticated) {
      let user = request.auth.credentials;

      // delete cookie on client side
      request.cookieAuth.clear();

      // delete session in cache
      request.server.app.cache.drop('user:' + user.id, (err) => {
        if (err) { return reply(Boom.badImplementation('Cache error')); }
        else { return reply('logged out'); }
      });
    }
    else { return reply('logged out'); }
  }
};
