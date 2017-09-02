module.exports = {
  method: 'GET',
  path: '/billing',
  config: {
    auth: { strategy: 'session', mode: 'try' },
  },
  handler: (request, reply) => {
    return reply.file('./billing.html');
  }
}
