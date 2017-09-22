module.exports = {
  method: 'GET',
  path: '/',
  config: { auth: false },
  handler: (request, reply) => {
    return reply.file('./index.html');
  }
};
