// debugging
require('make-promises-safe');

const configs = require('./configs');


// VENDOR MODULES

const path = require('path');
const Hapi = require('hapi');
// const Good = require('good');
const Inert = require('inert');
// const Redis = require('catbox-redis');
// const Auth = require('hapi-auth-cookie');


// LOCAL MODULES

const db = require('./database');
// const routes = require('./routes');
const authOptions = configs.auth;
// const logOptions = configs.logging;


// PLUGINS

const Auth = require('./plugins/hapi-auth');
const slack = require('./plugins/slack');
const mailer = require('./plugins/sendgrid');
const alert = require('./plugins/alert');
const account = require('./plugins/account');
const plans = require('./plugins/plans');
const subscriptions = require('./plugins/subscriptions');
const world = require('./plugins/world');
const stripe = require('./plugins/stripe');
const paypal = require('./plugins/paypal');
const amazon = require('./plugins/amazon');
const radius = require('./plugins/radius');
const authorization = require('./plugins/authorization');


// SERVER INSTANTIATION AND CONFIGURATION

const files = { relativeTo: path.join(__dirname, 'public') }; // deliver files from public dir
const server = global.server = new Hapi.Server({
  port: configs.port,
  host: configs.host,
  tls: configs.tls,
  routes: {
    files,
    cors: { // TODO remove cors on prod
      origin: ['*'],
      credentials: true
    }
  }
  // cache: [{
  //   engine: Redis,
  //   host: '127.0.0.1',
  //   partition: 'cache'
  // }]
});

// transient cookie store
server.state('cypherghost', {
  ttl: 5 * 60 * 1000,
  isSecure: !!configs.tls,
  isHttpOnly: true,
  encoding: 'base64json',
  path: '/',
  clearInvalid: true,
  strictHeader: true
});


// REQUEST DECORATIONS AND METHODS

// slack integration
server.decorate('request', 'slack', slack);
// sendgrid integration
server.decorate('request', 'mailer', mailer);
// alert integration
server.decorate('request', 'alert', alert);
// account integration
server.decorate('request', 'account', account);
// plans integration
server.decorate('request', 'plans', plans);
// subscription integration
server.decorate('request', 'subscriptions', subscriptions);
// world integration
server.decorate('request', 'world', world);
// stripe integration
server.decorate('request', 'stripe', stripe);
// paypal integration
server.decorate('request', 'paypal', paypal);
// amazon integration
server.decorate('request', 'amazon', amazon);
// radius decoration
server.decorate('request', 'radius', radius);
// db decoration
server.decorate('request', 'db', db);

// server methods
server.method('isAuthorized', authorization.isAuthorized);


// BOOTSTRAP AND START SERVER

async function bootstrap () {
  // static file serving
  await server.register({ plugin: Inert });

  // logging
  // await server.register({ plugin: Good, options: logOptions }); });

  // auth strategy
  // session caching (30 days)
  // TODO: double check cache expiresIn - use redis instead to persist session forever
  server.app.cache = server.cache({ segment: 'sessions', expiresIn: 2147483647 });
  await server.register({ plugin: Auth })
    .then(() => { authOptions(server); });

  // routes (must come after inert)
  // server.route(routes);

  // start server
  return server.start()
    // print server started
    .then(() => { console.log(`Server running at: ${server.info.uri}`); })
    // catch all error handling
    .catch((err) => { throw err; });
}

bootstrap();
