const Boom = require('boom');

module.exports = {
  method: 'GET',
  path: '/api/v1/admin/users/counts',
  config: {
    auth: { strategy: 'session', mode: 'required' }
    // auth: false
  },
  handler: (request, reply) => {
    let promises = [
      request.db('users').count('type').where({ type: 'trial' }).then(scalar),
      request.db('users').count('type').where({ type: 'pending' }).then(scalar),
      request.db('users').count('type').where({ type: 'invitation' }).then(scalar),
      request.db('users').count('type').where({ type: 'free' }).then(scalar),
      request.db('users').count('type').where({ type: 'premium' }).then(scalar),
      request.db.select('count').from('user_counters').where({ type: 'registered' }).then(scalar),
      request.db.select('count').from('user_counters').where({ type: 'confirmed' }).then(scalar),
    ];

    function scalar(data) {
      if (data.length) { return parseInt(data[0].count); }
      else { return 0; }
    }

    let promise = Promise.all(promises)
    .then((counts) => {
      console.log(counts);

      return {
        trial: counts[0],
        pending: counts[1],
        invitation: counts[2],
        free: counts[3],
        premium: counts[4],
        registered: counts[5],
        confirmed: counts[6]
      };
    })
    .catch((e) => { return Boom.badImplementation(e); });
    return reply(promise);
  }
};
