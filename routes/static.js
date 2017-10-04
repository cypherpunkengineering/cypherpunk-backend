const path = require('path');

module.exports = {
  method: 'GET',
  path: '/static/{param*}',
  config: { auth: false },
  handler: {
    directory: {
      path: path.join(__dirname, '..', 'public', 'static'),
      index: true
    }
  }
};
