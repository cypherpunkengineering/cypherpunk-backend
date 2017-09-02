module.exports = {
  method: 'GET',
  path: '/api/v2/account',
  config: { auth: { mode: 'required' } },
  handler: (request, reply) => {
    return reply(request.auth.credentials);
    
    let promise = request.db.select().from('users').where({ email: 'test@test.test' }).first()
    .then(user => JSON.stringify(user));
    return reply(promise);
  }
}