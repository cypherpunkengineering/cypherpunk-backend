const mailer = require('../lib/mailer');
const common = require('../lib/common');
const templateIds = require('../templateIds');


/**
 * args: {
 *   to: string, (user's email)
 *   id: string, (user's id)
 *   pendingEmailToken: string, (user's recovery token)
 * }
 */
function changeEmail(args) {
  return mailer.mail({
    to: args.to,
    from: {
      name: 'Cypherpunk Privacy',
      email: 'hello@cypherpunk.com'
    },
    subject: 'Confirm your new email address',
    templateId: templateIds.transactional,
    substitutions: {
      titleText: `You're almost done...`,
			regularText: 'Click the button below to confirm your new email address',
			buttonText: 'CONFIRM MY EMAIL',
			buttonURL: common.generateChangeConfirmationUrl(args.id, args.pendingEmailToken)
    }
  })
  .then(() => { console.log('Sent email change confirmation email to: ' + args.to); });
}

module.exports = changeEmail;
