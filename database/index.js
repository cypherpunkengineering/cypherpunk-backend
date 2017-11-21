const dbConfig = require('../configs').postgres;

const dbConnection = { database: dbConfig.database };
dbConnection.user = dbConfig.user || undefined;
dbConnection.password = dbConfig.password || undefined;

const knex = require('knex')({
  client: 'pg',
  connection: dbConnection,
  migrations: { tableName: 'knex_migrations' }
});

module.exports = knex;
