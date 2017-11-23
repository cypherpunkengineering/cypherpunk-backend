const Joi = require('joi');
const Boom = require('boom');
const bcrypt = require('bcrypt');
const randToken = require('rand-token');

module.exports = {
  method: 'POST',
  path: '/api/v1/account/purchase/stripe',
  options: {
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
  handler: async (request, h) => {
    // get plan based on request.payload.plan
    let planType = request.plans.getPricingPlanType(request.payload.plan);
    if (!planType) { return Boom.badRequest('Invalid Plan'); }
    console.log('PlanType: ', planType);

    // get stripePlan based on request.payload.plan
    let stripePlanId = request.plans.getStripePlanIdForReferralCode(request.payload.plan);
    if (!stripePlanId) { return Boom.badRequest('Invalid Plan'); }
    console.log('StripePlanId: ', stripePlanId);

    // generate subscriptino renewal date
    let subscriptionRenewal = request.subscriptions.calculateRenewal(stripePlanId);
    if (!subscriptionRenewal) {
      return Boom.badImplementation('Unable to calculate subscription renewal');
    }
    console.log('Subscription Renewal: ', subscriptionRenewal);

    try {
      // create stripe account
      let stripeArgs = {
        plan: stripePlanId,
        source: request.payload.token,
        email: request.payload.email.toLowerCase()
      };
      let customer = await request.stripe.api.customers.create(stripeArgs);

      // create user account
      let user = {
        email: request.payload.email.toLowerCase(),
        password: bcrypt.hashSync(request.payload.password, 15),
        secret: randToken.generate(32),
        type: 'premium',
        priority: 1,
        confirmed: false,
        confirmation_token: randToken.generate(32)
      };
      user = await request.db.insert(user).into('users').returning('*');
      user = user[0];

      // create stripe source objects
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
      await Promise.all(promises);

      // create stripe object
      let stripeData = { customer_id: customer.id, stripe_data: customer };
      let stripeObject = await request.db.insert(stripeData).into('stripe').returning('*');
      stripeObject = stripeObject[0];

      // create subscription
      let subscription = {
        user_id: user.id,
        type: planType,
        plan_id: stripePlanId,
        provider: 'stripe',
        provider_id: stripeObject.id,
        active: true,
        current: true,
        start_timestamp: new Date(),
        purchase_timestamp: new Date(),
        expiration_timestamp: subscriptionRenewal,
        current_period_start_timestamp: new Date(),
        current_period_end_timestamp: subscriptionRenewal
      };
      await request.db.insert(subscription).into('subscriptions').returning('*');

      // create session and cookie for user
      let cachedUser = { id: user.id, email: user.email.toLowerCase(), type: user.type };
      await request.server.app.cache.set('user:' + user.id, cachedUser, 0);
      request.cookieAuth.set({ sid: 'user:' + user.id });

      // create radius tokens
      let username = request.radius.makeRandomString(26);
      let password = request.radius.makeRandomString(26);
      await request.radius.addToken(user.id, username, password);
      await request.radius.addTokenGroup(username, user.type);

      // send welcome email
      let msg = { to: user.email, id: user.id, confirmationToken: user.confirmation_token };
      await request.mailer.registration(msg);

      // notify slack of new signup
      request.slack.billing(`[SIGNUP] ${user.email} has signed up for an account`);

      // update count
      await updateRegisteredCount(request.db);

      // print count to slack
      request.slack.count();

      return h.response().code(200);
    }
    catch (err) { return Boom.badImplementation(err); }
  }
};

function updateRegisteredCount (db) {
  return db('user_counters').where({ type: 'registered' }).increment('count');
}

async function logout (request, h) {
  // skip if not authenticated
  if (!request.auth.isAuthenticated) { return true; }

  // otherwise get user from request.auth;
  let user = request.auth.credentials;

  // delete cookie on client side
  request.cookieAuth.clear();

  // delete session in cache
  try { return await request.server.app.cache.drop('user:' + user.id); }
  catch (err) { return Boom.badImplementation('Delete Session Error'); }
}

async function checkEmail (request, h) {
  let email = request.payload.email.toLowerCase();
  let result = await request.db.select('id').from('users').where({ email: email });
  if (result.length) { return Boom.badRequest('Email already in use'); }
  else { return true; }
}
