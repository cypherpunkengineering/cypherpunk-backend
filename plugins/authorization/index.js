const Boom = require('boom');
const authorizedUserTypes = [
  'developer',
  'staff'
];

function isAuthorized(request, reply) {
  let userType = request.auth.credentials.type;
  if (authorizedUserTypes.includes(userType)) { return reply(); }
  else { return reply(Boom.forbidden()); }
}

module.exports = {
  isAuthorized: isAuthorized
};
