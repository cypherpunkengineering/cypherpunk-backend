const Joi = require('joi');
const Boom = require('boom');
const crypto = require('crypto');
const algo = 'aes-256-ctr';
const salt = 'jsucksballsformakingmedothisshit';

module.exports = {
  method: 'GET',
  path: '/api/v1/emails/unsubscribe',
  config: {
    auth: false,
    validate: {
      query: {
        email: Joi.string().required(),
        token: Joi.string().required()
      }
    }
  },
  handler: (request, reply) => {
    let email = request.query.email;
    let token = request.query.token;

    // check token validity
    let encrypted = encrypt(email);
    if (token !== encrypted) { return reply(Boom.badRequest('Invalid Token')); }

    // insert email into db
    let promise = request.db('unsubscribe_list').insert({ email: email })
    .then(() => { return 'Unsubscribed!'; })
    .catch((e) => {
      // handle unique constraint error
      if (e.code === '23505') { return 'Unsubscribed!'; }

      console.log(e);
      if (e.isBoom) { return e; }
      else { return Boom.badImplementation(); }
    });

    return reply(promise);
  }
};

// ed@cypherpunk.com === 3ae7b7228cc9e3547579dd5f8bfb1c80b8

function encrypt(text){
  var cipher = crypto.createCipher(algo, salt);
  var crypted = cipher.update(text,'utf8','hex');
  crypted += cipher.final('hex');
  return crypted;
}
