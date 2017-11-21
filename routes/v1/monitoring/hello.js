const Boom = require('boom');

module.exports = {
  method: 'GET',
  path: '/api/v1/monitoring/hello',
  options: { auth: false },
  handler: async (request, h) => {
    try {
      await request.db.select().from('user_counters').limit(1);
      return { status: 'ok' };
    }
    catch (err) {
      console.log(err);
      return Boom.badImplementation({ status: 'fail' });
    }
  }
};
