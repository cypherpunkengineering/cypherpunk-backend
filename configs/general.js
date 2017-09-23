var env = (process.env.NODE_ENV || 'DEV').toUpperCase();
switch (env) {
  case 'DEV':
  case 'PROD':
  case 'STAGING':
    break;
  case 'DEVELOPMENT':
    env = 'DEV';
    break;
  case 'PRODUCTION':
    env = 'PROD';
    break;
  case 'STAGING':
    env = 'STAGING';
    break;
  default:
    console.warn("Unrecognized NODE_ENV, defaulting to 'DEV'");
    env = 'DEV';
    break;
}

module.exports = {
  env, // ['DEV', 'PROD', 'STAGING']
  host: process.env.HOST || 'localhost',
  port: process.env.PORT || 9000
};
