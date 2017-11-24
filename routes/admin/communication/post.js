const Joi = require('joi');
const Boom = require('boom');
const crypto = require('crypto');

module.exports = {
  method: 'POST',
  path: '/api/v1/admin/communication',
  options: {
    auth: { strategy: 'session', mode: 'required' },
    // auth: false,
    validate: {
      payload: {
        group: Joi.string().required(),
        subject: Joi.string().required(),
        titleText: Joi.string().required(),
        regularText: Joi.string().required()
      }
    },
    pre: [ { method: isAuthorized } ]
  },
  handler: async (request, h) => {
    let group = request.payload.group;
    let email = {
      subject: request.payload.subject,
      substitutions: {
        titleText: request.payload.titleText,
        regularText: request.payload.regularText
      }
    };

    let handler;
    switch (group) {
      case 'ed':
        handler = getEd;
        break;

      case 'dev':
        handler = getDevUsers;
        break;

      case 'confirmed':
        handler = getConfirmedUsers;
        break;

      case 'unconfirmed':
        handler = getUnconfirmedUsers;
        break;

      case 'all':
        handler = getAllUsers;
        break;

      default:
        return Boom.badRequest('Invaild Group Option');
    }

    try {
      let recipients = await handler(request);
      mailUsers(recipients, email, request.mailer);
      return h.response().code(200);
    }
    catch (err) { return Boom.badImplementation(err); }
  }
};

async function getEd (request) {
  await request.db.select('email').from('users').where({ email: 'ed@cypherpunk.com' });
}

async function getDevUsers (request) {
  await request.db.select('email').from('users')
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

async function getConfirmedUsers (request) {
  await request.db.select('email').from('users').where({ confirmed: true });
}

async function getUnconfirmedUsers (request) {
  await request.db.select('email').from('users').where({ confirmed: false });
}

async function getAllUsers (request) {
  await request.db.select('email').from('users');
}

function mailUsers (users, email, mailer) {
  let timer = 0;
  users.forEach((user) => {
    // space email out by 100ms
    timer = timer + 100;

    // start timeout to send email
    setTimeout(() => {
      let token = encrypt(user.email);
      let unsub = `https://cypherpunk.com/unsubscribe?email=${user.email}&token=${token}`;
      email.to = user.email;
      email.substitutions.unsubLink = unsub;
      mailer.massCom(email);
    }, timer);
  });
}

function encrypt (text) {
  var cipher = crypto.createCipher('aes-256-ctr', 'jsucksballsformakingmedothisshit');
  var crypted = cipher.update(text, 'utf8', 'hex');
  crypted += cipher.final('hex');
  return crypted;
}

async function isAuthorized (request, h) {
  return request.server.methods.isAuthorized(request, h);
}
