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

var host = process.env.HOST || 'localhost';
var address = process.env.ADDRESS || (env === 'DEV' ? '127.0.0.1' : '0.0.0.0');
var port = process.env.PORT || 11080;

var tls = undefined;
try {
  tls = {
    cert: fs.readFileSync('./cert.pem'),
    key: fs.readFileSync('./privkey.pem'),
  };
} catch (e) {}

module.exports = {
  env,     // 'DEV', 'PROD', 'STAGING'
  host,    // 'localhost'
  address, // '0.0.0.0'
  port,    // 11080
  tls,     // { cert: '<file contents>', key: '<file contents>' }
};
