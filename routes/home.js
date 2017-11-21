const path = require('path');

module.exports = {
  method: 'GET',
  path: '/{params?}',
  options: { auth: false },
  handler: async function (request, h) {
    return h.file(path.join(__dirname, '..', 'public', 'static', 'index.html'));
  }
};
