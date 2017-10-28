const mailer = require('../lib/mailer');
const common = require('../lib/common');
const templateIds = require('../templateIds');

/**
 * args: {
 *   to: string, (user's email)
 *   id: string, (user's id)
 *   recoveryToken: string, (user's recovery token)
 * }
 */
function migration(args) {
  return mailer.mail({
    to: args.to,
    from: {
      name: 'Cypherpunk Privacy',
      email: 'hello@cypherpunk.com'
    },
    subject: `We've reset your password`,
    templateId: templateIds.transactional,
    substitutions: {
      titleText: `We've moved to a better system!`,
			regularText: 'Click the button below to set your new account password',
			buttonText: 'RESET MY PASSWORD',
			buttonURL: common.generateAccountRecoveryUrl(args.id, args.recoveryToken)
    }
  })
  .then(() => { console.log('Sent recovery email to: ' + args.to); });
}

module.exports = migration;
