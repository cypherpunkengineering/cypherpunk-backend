const mailer = require('../lib/mailer');
const common = require('../lib/common');
const templateIds = require('../templateIds');

/**
 * args: {
 *   to: string, (user's email)
 *   id: string, (user's id)
 *   confirmationToken: string, (user's confirmation token)
 * }
 */
function registration(args) {
  return mailer.mail({
    to: args.to,
    from: {
      name: 'Cypherpunk Privacy',
      email: 'hello@cypherpunk.com'
    },
    subject: 'Activate your account to get started with Cypherpunk Privacy',
    templateId: templateIds.transactional,
    substitutions: {
      titleText: `You're only one step away`,
			regularText: 'Click the button below to confirm your free trial to Cypherpunk Privacy',
			buttonText: 'ACTIVATE MY ACCOUNT',
			buttonURL: common.generateConfirmationUrl(args.id, args.confirmationToken)
    }
  })
  .then(() => { console.log('Sent registration confirmation email to: ' + args.to); });
}

module.exports = registration;
