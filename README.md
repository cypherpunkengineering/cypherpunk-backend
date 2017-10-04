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
 - pg (Postgres Connector)
 - mongodb (mongo *sigh*)
 - catbox-redis (Redis connector)
 - bcrypt
 - rand-token (random token generator)
 - @slack/client (slack sdk/api)
 - @sendgrid/mail (sendgrid mail api)
 - stripe
 - xml2js
 - request
 - request-promise
 - mongodb
 - node-schedule


## Configuration
Configuration Files:
Things to set on prod:
- config/auth.js
- config/logging.js
- config/general.js (general server configurations)
- config/sendgrid.js (sendgrid -apikey- configurations)
- knexfile.js (postgres connection config) //TODO: how to set to prod?


## Installation
* `npm install` to install node dependencies
* run `./database/schema/up.sql` file in postgres


## Running
Set env on NODE_ENV env var or will default to 'DEV'
Set port on PORT env var or will default to 9000
Set host on HOST env var or will default to 'localhost'
Main file: server.js
  - run with PM2 for production
  - run with nodemon for dev
Daemons:
  - run ./daemons/expire-user in a separate thread using PM2
  - run ./daemons/amazon-recurring in a separate thread using PM2


## TODO:
 -- billing system


## DEV

Nodemon will need to be installed globally using `npm install -g nodemon`  
Angular CLI will need to be installed globally using `npm install -g @angular/cli@latest`  
Launch the backend server using `nodemon server.js`  
Then use the command `ng serve --proxy-config proxy.config.json` to launch a build of the webpages.
All api calls should automatically be proxied to the backend server through :4200.
