const Boom = require('boom');

module.exports = {
  method: 'GET',
  path: '/api/v1/monitoring/hello',
  config: { auth: false },
  handler: (request, reply) => {
    let promise = request.db.select().from('user_counters').limit(1)
    .then((data) => {
      if (data.length) { return { status: 'ok' }; }
      else { return Promise.reject(Boom.badImplementation({ status: 'fail' })); }
    })
    .catch((e) => {
      console.log(e);
      if (e.isBoom) { return e; }
      else { return Boom.badImplementation({ status: 'fail' }); }
    });

    return reply(promise);
  }
};
