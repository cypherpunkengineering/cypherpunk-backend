This is still a work in progress.

Current dependencies:
postgres
redis
node

NPM dependencies:
 - hapi (Server Framework)
 - hapi-auth-cookie (Server cookie auth)
 - good (Logging)
 - good-console (Log to console)
 - good-squeeze (Log aggregator)
 - good-fiel (Log to file)
 - boom (Error HTTP Responses for hapi)
 - inert (Static file serving for hapi)
 - joi (Input validation plugin for hapi)
 - knex (Database Query Engine)
 - bookself (Database ORM)
 - pg (Postgres Connector)
 - bcrypt

Main file: server.js - run with PM2 for production
Set port on PORT env var or will default to 9000
Set host on HOST env var or will default to 'localhost'

Things to set on prod:
 - config/auth.js
 - config/database.js
