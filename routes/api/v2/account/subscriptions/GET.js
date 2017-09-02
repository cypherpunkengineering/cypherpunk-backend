module.exports = {
  method: 'GET',
  path: '/api/v2/account/subscriptions',
  config: { auth: { mode: 'required' } },
  handler: (request, reply) => {
    let userId = request.auth.credentials.id;
    return reply([].concat(request.db.select().from('subscriptions').where({ userId })));
    return reply(request.auth.credentials.id);
    
    let promise = request.db.select().from('users').where({ email: 'test@test.test' }).first()
    .then(user => JSON.stringify(user));
    return reply(promise);
  }
}