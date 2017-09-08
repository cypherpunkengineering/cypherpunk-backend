const config = require('./configs/general');
const PORT = config.port;
const HOST = config.host;

// vendor modules
const path = require('path');
const Hapi = require('hapi');
const Good = require('good');
const Inert = require('inert');
const Redis = require('catbox-redis');
const Auth = require('hapi-auth-cookie');

// local modules
const db = require('./database');
const routes = require('./routes');
const authOptions = require('./configs/auth');
const logOptions = require('./configs/logging');

// plugins
const slack = require('./plugins/slack');
const mailer = require('./plugins/sendgrid');
const plans = require('./plugins/plans');
const subscriptions = require('./plugins/subscriptions');
const stripe = require('./plugins/stripe');
const amazon = require('./plugins/amazon');

// bootstrap server with redis as a cache
const server = new Hapi.Server({ cache: [{
  engine: Redis,
  host: '127.0.0.1',
  partition: 'cache'
}]});
const files = { relativeTo: path.join(__dirname, 'public') }; // deliver files from public dir
server.connection({ port: PORT, host: HOST, routes: { files } });

// static file serving
server.register(Inert)
// logging
.then(() => { return server.register({ register: Good, options: logOptions }); })
// slack integration
.then(() => { return server.decorate('request', 'slack', slack); })
// sendgrid integration
.then(() => { return server.decorate('request', 'mailer', mailer); })
// plans integration
.then(() => { return server.decorate('request', 'plans', plans); })
// subscription integration
.then(() => { return server.decorate('request', 'subscriptions', subscriptions); })
// stripe integration
.then(() => { return server.decorate('request', 'stripe', stripe); })
// amazon integration
.then(() => { return server.decorate('request', 'amazon', amazon); })
// db decoration
.then(() => { return server.decorate('request', 'db', db); })
// session caching (30 days)
// TODO: double check cache expiresIn - use redis instead to persist session forever
.then(() => { server.app.cache = server.cache({ segment: 'sessions', expiresIn: 2147483647 }); })
// auth strategy
.then(() => { return server.register({ register: Auth }).then(() => { authOptions(server); }); })
// routes (must come after inert)
.then(() => { return server.route(routes); })
// start server
.then(() => { return server.start(); })
// print server started
.then(() => { console.log(`Server running at: ${server.info.uri}`); })
// catch all error handling
.catch((err) => { throw err; });
