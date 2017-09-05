module.exports = function(server) {
  const cache = server.app.cache;
  server.auth.strategy('session', 'cookie', true, {
    password: 'password-should-be-32-characters',
    cookie: 'cypherpunk-session',
    ttl: 2147483647,
    keepAlive: true,
    clearInvalid: true,
    isSecure: false, // TODO: set this to true on PROD
    validateFunc: function (request, session, callback) {
      cache.get(session.sid, (err, cached) => {
        if (err) { return callback(err, false); }
        if (!cached) { return callback(null, false); }
        return callback(null, true, cached);
      });
    }
  });
};
