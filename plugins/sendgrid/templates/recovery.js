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
function recovery(args) {
  return mailer.mail({
    to: args.to,
    from: {
      name: 'Cypherpunk Privacy',
      email: 'hello@cypherpunk.com'
    },
    subject: 'Reset your password',
    templateId: templateIds.transactional,
    substitutions: {
      titleText: 'Reset your account password',
			regularText: 'Click the button below to set your new account password',
			buttonText: 'RESET MY PASSWORD',
			buttonURL: common.generateAccountRecoveryUrl(args.id, args.recoveryToken)
    }
  })
  .then(() => { console.log('Sent recovery email to: ' + args.to); });
}

module.exports = recovery;
