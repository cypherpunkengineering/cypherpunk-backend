const stripeConfig = require('../../configs/stripe');
const Stripe = require('stripe')(stripeConfig.secret_key);
module.exports = Stripe;
