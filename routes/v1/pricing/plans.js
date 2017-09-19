module.exports = {
  method: 'GET',
  path: '/api/v1/pricing/plans',
  config: { auth: false },
  handler: (request, reply) => {
    let defaultPlans = request.plans.getDefaultPlans();
    return reply(defaultPlans);
  }
};
