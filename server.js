const PORT = process.env.PORT || 9000;
const HOST = process.env.HOST || 'localhost';

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


// db.select().from('users').first()
// .then((data) => {
//   console.log(data);
// });
