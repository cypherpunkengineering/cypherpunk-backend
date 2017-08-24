## Dependencies

System dependencies:
postgres
redis
node (via nvm)
PM2 (via npm install -g pm2)
knex (via npm install -g knex)

NPM dependencies:
 - hapi (Server Framework)
 - hapi-auth-cookie (Server cookie auth)
 - good (Logging)
 - good-console (Log to console)
 - good-squeeze (Log aggregator)
 - good-file (Log to file)
 - boom (Error HTTP Responses for hapi)
 - inert (Static file serving for hapi)
 - joi (Input validation plugin for hapi)
 - knex (Database Query Engine)
 - bookself (Database ORM)
 - pg (Postgres Connector)
 - bcrypt
 - catbox-redis (Redis connector)


## Configuration

Configuration Files:
Things to set on prod:
- config/auth.js
- config/database.js


## Installation
* `npm install` to install node dependencies
* `knex migration:latest` to run all DB migrations


## Running

Set port on PORT env var or will default to 9000
Set host on HOST env var or will default to 'localhost'
Main file: server.js
  - run with PM2 for production
  - run with nodemon for dev
