const path = require('path');

module.exports = {
  method: 'GET',
  path: '/{params?}',
  config: { auth: false },
  handler: function(request, reply) {
    return reply.file(path.join(__dirname, '..', 'public', 'static', 'index.html'));
  }
};
