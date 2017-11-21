module.exports = {
  method: 'GET',
  path: '/api/v1/pricing/plans',
  options: { auth: false },
  handler: async (request, h) => {
    return request.plans.getDefaultPlans();
  }
};
