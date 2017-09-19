const Joi = require('joi');
const Boom = require('boom');
const bcrypt = require('bcrypt');
const randToken = require('rand-token');

module.exports = {
  method: 'POST',
  path: '/api/v1/account/purchase/amazon',
  config: {
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
  handler: (request, reply) => {
    // TODO: error if already logged in

    // get plan based on request.payload.plan
    let planType = request.plans.getPricingPlanType(request.payload.plan);
    if (!planType) { return reply(Boom.badRequest('Invalid Plan')); }
    console.log('PlanType: ', planType);

    // get stripePlan based on request.payload.plan
    let planId = request.plans.defaultPlanId[request.payload.plan];
    if (!planId) { return reply(Boom.badRequest('Invalid Plan')); }
    console.log('PlanId: ', planId);

    let plan = request.plans.getPlanByTypeAndID(planType, planId);
    if (!plan || !plan.price) { return reply(Boom.badRequest('Invalid Plan')); }
    console.log('Plan: ', plan);

    // generate subscriptino renewal date
    let subscriptionRenewal = request.subscriptions.calculateRenewal(planId);
    if (!subscriptionRenewal) {
      return reply(Boom.badImplementation('Unable to calculate subscription renewal'));
    }
    console.log('Subscription Renewal: ', subscriptionRenewal);

    // amazon args
    let amazonArgs = {
      plan: planId,
      AmazonBillingAgreementId: request.payload.AmazonBillingAgreementId
    };

    // confirm amazon billing agreement
    let user, authorizeArgs;
    let promise = request.amazon.confirmBillingAgreement(amazonArgs)
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
    // send amazon auth request
    .then(() => {
      // prepare arguments for authorization API call
      authorizeArgs = {
        AmazonBillingAgreementId: request.payload.AmazonBillingAgreementId,
        currency: 'USD',
        price: plan.price,
        authorizationReference: randToken.generate(32),
        userId: user.id
      };
      return request.amazon.authorizeOnBillingAgreement(authorizeArgs);
    })
    // create amazon object in db
    .then(() => {
      return request.db.insert({
        billing_agreement_id: request.payload.AmazonBillingAgreementId,
        amazon_data: authorizeArgs
      }).into('amazon').returning('*')
      .then((data) => { return data[0]; });
    })
    // create subscription
    // TODO: unset current on the default subscription
    .then((provider) => {
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
        renewal_timestamp: subscriptionRenewal,
        current_period_start_timestamp: new Date(),
        current_period_end_timestamp: subscriptionRenewal
      };
      return request.db.insert(subscription).into('subscriptions').returning('*');
    })
    // create charge
    .then(() => {
      return request.db.insert({
        gateway: 'amazon',
        transaction_id: authorizeArgs.authorizationReference,
        user_id: user.id,
        plan_id: planId,
        currency: 'USD',
        amount: plan.price,
        data: authorizeArgs
      }).into('charges').returning('*');
    })
    // create session and cookie for user
    .then(() => {
      return new Promise((resolve, reject) => {
        // set session? cookie? I forget.
        let cachedUser = { id: user.id, email: user.email.toLowerCase() };
        request.server.app.cache.set('user:' + user.id, cachedUser, 0, (err) => {
          if (err) { return reject(err); }
          request.cookieAuth.set({ sid: 'user:' + user.id });
          return resolve();
        });
      });
    })
    // TODO: update radius
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
