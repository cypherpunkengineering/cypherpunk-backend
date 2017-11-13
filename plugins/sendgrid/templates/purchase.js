const mailer = require('../lib/mailer');
const common = require('../lib/common');
const templateIds = require('../templateIds');

/**
 * args: {
 *   to: string, (user's email)
 *   subscriptionPrice: string, (subscription price)
 *   subcriptionRenewal: string, (how often subscription renews)
 *   subscriptionExpiration: string, (when this subscription expires)
 * }
 */
function purchase(args) {
  return mailer.mail({
    to: args.to,
    from: {
      name: 'Cypherpunk Privacy',
      email: 'support@cypherpunk.com'
    },
    subject: `You've got Premium Access to Cypherpunk Privacy`,
    templateId: templateIds.purchase,
    substitutions: {
      userEmail: args.to,
			subscriptionPrice: args.subscriptionPrice,
			subscriptionRenewal: args.subscriptionRenewal,
			subscriptionExpiration: common.formatDate(args.subscriptionExpiration)
    }
  })
  .then(() => { console.log('Sent purchase email to: ' + args.to); });
}

module.exports = purchase;
