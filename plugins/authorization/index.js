const Boom = require('boom');
const authorizedUserTypes = [
  'developer',
  'staff'
];

async function isAuthorized (request, h) {
  let userType = request.auth.credentials.type;
  if (authorizedUserTypes.includes(userType)) { return true; }
  else { return Boom.forbidden(); }
}

module.exports = {
  isAuthorized: isAuthorized
};
