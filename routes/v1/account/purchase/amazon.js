const Joi = require('joi');
const Boom = require('boom');
const bcrypt = require('bcrypt');
const randToken = require('rand-token');

module.exports = {
  method: 'POST',
  path: '/api/v1/account/purchase/amazon',
  options: {
    auth: { strategy: 'session', mode: 'try' },
    validate: {
      payload: {
        plan: Joi.string().required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required(),
        AmazonBillingAgreementId: Joi.string().required()
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
    let planId = request.plans.defaultPlanId[request.payload.plan];
    if (!planId) { return Boom.badRequest('Invalid Plan'); }
    console.log('PlanId: ', planId);

    let plan = request.plans.getPlanByTypeAndID(planType, planId);
    if (!plan || !plan.price) { return Boom.badRequest('Invalid Plan'); }
    console.log('Plan: ', plan);

    // generate subscriptino renewal date
    let subscriptionRenewal = request.subscriptions.calculateRenewal(planId);
    if (!subscriptionRenewal) {
      return Boom.badImplementation('Unable to calculate subscription renewal');
    }
    console.log('Subscription Renewal: ', subscriptionRenewal);

    try {
      // confirm amazon billing agreement
      let amazonArgs = {
        plan: planId,
        AmazonBillingAgreementId: request.payload.AmazonBillingAgreementId
      };
      await request.amazon.confirmBillingAgreement(amazonArgs);

      // save user account
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

      // send amazon auth request
      let authorizeArgs = {
        AmazonBillingAgreementId: request.payload.AmazonBillingAgreementId,
        currency: 'USD',
        price: plan.price,
        authorizationReference: randToken.generate(32),
        userId: user.id
      };
      await request.amazon.authorizeOnBillingAgreement(authorizeArgs);

      // create amazon object in db
      let amazonObject = {
        billing_agreement_id: request.payload.AmazonBillingAgreementId,
        amazon_data: authorizeArgs
      };
      let provider = await request.db.insert(amazonObject).into('amazon').returning('*');
      provider = provider[0];

      // create subscription
      let subscription = {
        user_id: user.id,
        type: planType,
        plan_id: planId,
        provider: 'amazon',
        provider_id: provider.id,
        active: true,
        current: true,
        start_timestamp: new Date(),
        purchase_timestamp: new Date(),
        expiration_timestamp: subscriptionRenewal,
        current_period_start_timestamp: new Date(),
        current_period_end_timestamp: subscriptionRenewal
      };
      subscription = await request.db.insert(subscription).into('subscriptions').returning('*');
      subscription = subscription[0];

      // create charge
      let charge = {
        gateway: 'amazon',
        transaction_id: authorizeArgs.authorizationReference,
        user_id: user.id,
        subscription_id: subscription.id,
        plan_id: planId,
        currency: 'USD',
        amount: plan.price,
        data: authorizeArgs
      };
      await request.db.insert(charge).into('charges').returning('*');

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

      // return status 200
      return h.response().code(200);
    }
    catch (err) { return Boom.badImplementation(err); }
  }
};

async function updateRegisteredCount (db) {
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
