module.exports = {
  method: 'GET',
  path: '/api/v1/location/world',
  config: { auth: false },
  handler: (request, reply) => {
    let world = {
      region: request.world.regions,
      regionOrder: ['DEV'].concat(request.world.regionOrder),
      country: {}
    };

    // add 'Developement' to regions
    world.region.DEV = 'Development';

    // add all countries to world.country
    Object.keys(request.world.countries).forEach((region) => {
      Object.assign(world.country, request.world.countries[region]);
    });

    // return the world
    return reply(world);
  }
};
