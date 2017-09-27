const Joi = require('joi');
const Boom = require('boom');

module.exports = {
  method: 'POST',
  path: '/api/v1/admin/communication',
  config: {
    auth: { strategy: 'session', mode: 'required' },
    // auth: false,
    validate: {
      payload: {
        group: Joi.string().required(),
        subject: Joi.string().required(),
        titleText: Joi.string().required(),
        regularText: Joi.string().required()
      }
    }
  },
  handler: (request, reply) => {
    let promise;
    let group = request.payload.group;
    let email = {
      subject: request.payload.subject,
      substitutions: {
        titleText: request.payload.titleText,
        regularText: request.payload.regularText
      }
    };

    switch(group) {
      case 'ed':
        promise = getEd(request);
        break;

      case 'dev':
        promise = getDevUsers(request);
        break;

      case 'confirmed':
        promise = getConfirmedUsers(request);
        break;

      case 'unconfirmed':
        promise = getUnconfirmedUsers(request);
        break;

      case 'all':
        promise = getAllUsers(request);
        break;

      default:
        promise = defaultUsers();
    }

    promise.then((users) => { mailUsers(users, email, request.mailer); })
    .catch((err) => {
      console.log(err);
      if (err.isBoom) { return err; }
      else { return Boom.badImplementation(err.message); }
    });
    return reply(promise);
  }
};

function getEd(request) {
  return request.db.select('email')
  .from('users')
  .where({ email: 'ed@cypherpunk.com' });
}

function getDevUsers(request) {
  return request.db.select('email')
  .from('users')
  .whereIn('email', [
    'mike@cypherpunk.com',
    'kim@cypherpunk.com',
    'connie@cypherpunk.com',
    'tony@cypherpunk.com',
    'jon@cypherpunk.com',
    'chris@cypherpunk.com',
    'ed@cypherpunk.com'
  ]);
}

function getConfirmedUsers(request) {
  return request.db.select('email')
  .from('users')
  .where({ confirmed: true });
}

function getUnconfirmedUsers(request) {
  return request.db.select('email')
  .from('users')
  .where({ confirmed: false });
}

function getAllUsers(request) {
  return request.db.select('email').from('users');
}

function defaultUsers() {
  return Promise.reject(Boom.badRequest('Invaild Group Option'));
}

function mailUsers(users, email, mailer) {
  let timer = 0;
  users.forEach((user) => {
    // space email out by 100ms
    timer = timer + 100;

    // start timeout to send email
    setTimeout(() => {
      email.to = user.email;
      mailer.massCom(email);
    }, timer);
  });
}
