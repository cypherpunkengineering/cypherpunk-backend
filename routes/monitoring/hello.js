const Boom = require('boom');

module.exports = {
  method: 'GET',
  path: '/api/v1/monitoring/hello',
  config: { auth: false },
  handler: (request, reply) => {
    let promise = request.db.select('id').from('users').limit(1)
    .then((data) => {
      if (data.length) { return { status: 'ok' }; }
      else { return Boom.badImplementation({ status: 'fail' }); }
    })
    .catch((e) => {
      console.log(e);
      return Boom.badImplementation({ status: 'fail' });
    });

    return reply(promise);
  }
};
