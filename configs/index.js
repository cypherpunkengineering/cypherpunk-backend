const fs = require('fs');
const config = require('./config');


// ENVIRONMENT GLOBAL

config.env = (process.env.NODE_ENV || config.env || 'DEV').toUpperCase();
switch (config.env) {
  case 'DEV':
  case 'PROD':
  case 'STAGING':
    break;
  case 'DEVELOPMENT':
    config.env = 'DEV';
    break;
  case 'PRODUCTION':
    config.env = 'PROD';
    break;
  default:
    console.warn("Unrecognized NODE_ENV, defaulting to 'DEV'");
    config.env = 'DEV';
    break;
}


// HOST - ADDRESS - PORT

config.host = process.env.HOST || config.host || 'localhost';
config.address = process.env.ADDRESS || config.address || (config.env === 'DEV' ? '127.0.0.1' : '0.0.0.0');
config.port = process.env.PORT || config.port || 11080;


// TLS Config and Cert

try {
  config.tls = {
    cert: fs.readFileSync('./cert.pem'),
    key: fs.readFileSync('./privkey.pem')
  };
}
catch (e) { config.tls = undefined; }


// AUTH VALIDATION METHOD

config.auth = function (server) {
  const cache = server.app.cache;
  server.auth.strategy('session', 'cookie', {
    password: 'password-should-be-32-characters',
    cookie: 'cypherpunk-session',
    ttl: 2147483647,
    keepAlive: true,
    clearInvalid: true,
    isSameSite: false, // TODO: set this to true on PROD
    isSecure: false, // TODO: set this to true on PROD
    validateFunc: async function (request, session) {
      const out = { valid: false };
      try {
        const cached = await cache.get(session.sid);
        out.valid = !!cached;
        if (out.valid) { out.credentials = cached; }
      }
      catch (err) { out.valid = false; }
      return out;
    }
  });
  server.auth.default('session');
};


// EXPORT
module.exports = config;
