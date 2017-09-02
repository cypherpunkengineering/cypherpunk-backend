module.exports = {
  env: 'DEV', // ['DEV', 'PROD', 'STAGING']
  host: process.env.HOST || 'localhost',
  port: process.env.PORT || 9000
};
