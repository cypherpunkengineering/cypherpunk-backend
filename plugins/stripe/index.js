const stripeConfig = require('../../configs').stripe;
const Stripe = require('stripe')(stripeConfig.secret_key);


function verifyWebhook(rawBody, headerSignature) {
  return new Promise((resolve, reject) => {
    let event, secret = stripeConfig.endpoint_secret;

    try {
      event = Stripe.webhooks.constructEvent(rawBody, headerSignature, secret);
      console.log('Successfully confirmed stripe webhook: ', event.id);
      return resolve(event);
    }
    catch(e) {
      console.log('Error confirming stripe webhook: ', e.message);
      return reject(e);
    }
  });
}

module.exports = {
  api: Stripe,
  verify_webhook: verifyWebhook
};
