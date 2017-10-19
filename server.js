const config = require('./configs/general');

// vendor modules
const path = require('path');
const Hapi = require('hapi');
const Good = require('good');
const Inert = require('inert');
const Redis = require('catbox-redis');
// const Auth = require('hapi-auth-cookie');

// local modules
const db = require('./database');
const routes = require('./routes');
const authOptions = require('./configs/auth');
const logOptions = require('./configs/logging');

// plugins
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

// bootstrap server with redis as a cache
const server = global.server = new Hapi.Server({
  cache: [{
    engine: Redis,
    host: '127.0.0.1',
    partition: 'cache'
  }]
});
const files = { relativeTo: path.join(__dirname, 'public') }; // deliver files from public dir
server.connection({
  port: config.port,
  host: config.host,
  address: config.address,
  tls: config.tls,
  routes: {
    files,
    cors: { // TODO remove cors on prod
      origin: ['*'],
      credentials: true
    }
  }
});

// transient cookie store
server.state('cypherghost', {
  ttl: 5 * 60 * 1000,
  isSecure: !!config.tls,
  isHttpOnly: true,
  encoding: 'base64json',
  path: '/',
  clearInvalid: true,
  strictHeader: true
});

// static file serving
server.register(Inert)
// logging
.then(() => { return server.register({ register: Good, options: logOptions }); })
// slack integration
.then(() => { return server.decorate('request', 'slack', slack); })
// sendgrid integration
.then(() => { return server.decorate('request', 'mailer', mailer); })
// alert integration
.then(() => { return server.decorate('request', 'alert', alert); })
// account integration
.then(() => { return server.decorate('request', 'account', account); })
// plans integration
.then(() => { return server.decorate('request', 'plans', plans); })
// subscription integration
.then(() => { return server.decorate('request', 'subscriptions', subscriptions); })
// world integration
.then(() => { return server.decorate('request', 'world', world); })
// stripe integration
.then(() => { return server.decorate('request', 'stripe', stripe); })
// paypal integration
.then(() => { return server.decorate('request', 'paypal', paypal); })
// amazon integration
.then(() => { return server.decorate('request', 'amazon', amazon); })
// radius decoration
.then(() => { return server.decorate('request', 'radius', radius); })
// db decoration
.then(() => { return server.decorate('request', 'db', db); })
// session caching (30 days)
// TODO: double check cache expiresIn - use redis instead to persist session forever
.then(() => { server.app.cache = server.cache({ segment: 'sessions', expiresIn: 2147483647 }); })
// auth strategy
.then(() => { return server.register({ register: Auth }).then(() => { authOptions(server); }); })
// server methods
.then(() => { server.method('isAuthorized', authorization.isAuthorized); })
// routes (must come after inert)
.then(() => { return server.route(routes); })
// start server
.then(() => { return server.start(); })
// print server started
.then(() => { console.log(`Server running at: ${server.info.uri}`); })
// catch all error handling
.catch((err) => { throw err; });
