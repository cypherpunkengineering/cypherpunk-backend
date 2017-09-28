const Joi = require('joi');
const Boom = require('boom');
const bcrypt = require('bcrypt');
const randToken = require('rand-token');

module.exports = {
  method: 'POST',
  path: '/api/v1/account/purchase/stripe',
  config: {
    auth: { strategy: 'session', mode: 'try' },
    validate: {
      payload: {
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required(),
        token: Joi.string().required(),
        plan: Joi.string().required()
      }
    },
    // check if email already exists before handler
    pre: [
      { method: logout },
      { method: checkEmail }
    ]
  },
  handler: (request, reply) => {
    // get plan based on request.payload.plan
    let planType = request.plans.getPricingPlanType(request.payload.plan);
    if (!planType) { return reply(Boom.badRequest('Invalid Plan')); }
    console.log('PlanType: ', planType);

    // get stripePlan based on request.payload.plan
    let stripePlanId = request.plans.getStripePlanIdForReferralCode(request.payload.plan);
    if (!stripePlanId) { return reply(Boom.badRequest('Invalid Plan')); }
    console.log('StripePlanId: ', stripePlanId);

    // generate subscriptino renewal date
    let subscriptionRenewal = request.subscriptions.calculateRenewal(stripePlanId);
    if (!subscriptionRenewal) {
      return reply(Boom.badImplementation('Unable to calculate subscription renewal'));
    }
    console.log('Subscription Renewal: ', subscriptionRenewal);

    // stripe args
    let stripeArgs = {
      plan: stripePlanId,
      source: request.payload.token,
      email: request.payload.email.toLowerCase()
    };

    // create stripe account
    let customer, user, subscription;
    let promise = request.stripe.api.customers.create(stripeArgs)
    .then((stripeCustomer) => { customer = stripeCustomer; })
    // save user account
    .then(() => {
      user = {
        email: request.payload.email.toLowerCase(),
        password: bcrypt.hashSync(request.payload.password, 15),
        secret: randToken.generate(32),
        type: 'premium',
        priority: 1,
        confirmed: false,
        confirmation_token: randToken.generate(32)
      };
      return request.db.insert(user).into('users').returning('*')
      .then((data) => { user = data[0]; }); // hold on to user data
    })
    // create stripe source objects
    .then(() => {
      let promises = [];
      customer.sources.data.forEach((card) => {
        let cardPromise = request.db.insert({
          user_id: user.id,
          card_id: card.id,
          last4: card.last4,
          exp_month: card.exp_month,
          exp_year: card.exp_year,
          brand: card.brand
        }).into('stripe_sources');
        promises.push(cardPromise);
      });
      return Promise.all(promises);
    })
    // create stripe object
    .then(() => {
      return request.db.insert({
        customer_id: customer.id,
        stripe_data: customer
      }).into('stripe').returning('*')
      .then((data) => { return data[0]; });
    })
    // create subscription
    .then((stripeObj) => {
      subscription = {
        user_id: user.id,
        type: planType,
        plan_id: stripePlanId,
        provider: 'stripe',
        provider_id: stripeObj.id,
        active: true,
        current: true,
        start_timestamp: new Date(),
        purchase_timestamp: new Date(),
        expiration_timestamp: subscriptionRenewal,
        current_period_start_timestamp: new Date(),
        current_period_end_timestamp: subscriptionRenewal
      };
      return request.db.insert(subscription).into('subscriptions').returning('*')
      .then((data) => { subscription = data[0]; });
    })
    // create session and cookie for user
    .then(() => {
      return new Promise((resolve, reject) => {
        // set session? cookie? I forget.
        let cachedUser = { id: user.id, email: user.email.toLowerCase(), type: user.type };
        request.server.app.cache.set('user:' + user.id, cachedUser, 0, (err) => {
          if (err) { return reject(err); }
          request.cookieAuth.set({ sid: 'user:' + user.id });
          return resolve();
        });
      });
    })
    // create radius tokens
    .then(() => {
      let username = request.radius.makeRandomString(26),
          password = request.radius.makeRandomString(26);
      return request.radius.addToken(user.id, username, password)
      .then(() => { return request.radius.addTokenGroup(username, user.type); });
    })
    // send welcome email
    .then(() => {
      let msg = { to: user.email, id: user.id, confirmationToken: user.confirmation_token };
      request.mailer.registration(msg); // TODO catch and print?
    })
    // notify slack of new signup
    .then(() => {
      let text = `[SIGNUP] ${user.email} has signed up for an account :highfive:`;
      request.slack.billing(text); // TODO catch and print?
    })
    // update count
    .then(() => { return updateRegisteredCount(request.db); })
    // print count to slack
    .then(() => { request.slack.count(); }) // TODO catch and print?
    .catch((err) => { return Boom.badImplementation(err); });
    return reply(promise);
  }
};

function updateRegisteredCount(db) {
  return db('user_counters').where({ type: 'registered' }).increment('count');
}

function logout(request, reply) {
  // skip if not authenticated
  if (!request.auth.isAuthenticated) { return reply(); }

  // otherwise get user from request.auth;
  let user = request.auth.credentials;

  // delete cookie on client side
  request.cookieAuth.clear();

  // delete session in cache
  request.server.app.cache.drop('user:' + user.id, (err) => {
    if (err) { return reply(Boom.badImplementation('Delete Session Error')); }
    else { return reply(); }
  });
}

function checkEmail(request, reply) {
  let email = request.payload.email.toLowerCase();
  let promise = request.db.select('id').from('users').where({ email: email })
  .then((data) => {
    if (data.length) { return Boom.badRequest('Email already in use'); }
    else { return; }
  });
  return reply(promise);
}
