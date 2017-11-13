const mailer = require('../lib/mailer');
const common = require('../lib/common');
const templateIds = require('../templateIds');

/**
 * args: {
 *   to: string, (user's email)
 *   id: string, (user's id)
 *   recoveryToken: string, (user's recovery token)
 *   referralId: string (referrer's Id)
 *   referralName: string (referrer's Name)
 * }
 */
function teaserShare(args) {
  // adjust subject based on referralName
  let subject = `You've been invited to Cypherpunk Privacy`;
  if (args.referralName) { subject = `${args.referralName} has invited you to Cypherpunk Privacy`; }

  let regularText = 'Click the button below to accept your invitation';
  if (args.referralName) { regularText = regularText + ` from ${args.referralName}`; }

  return mailer.mail({
    to: args.to,
    from: {
      name: 'Cypherpunk Privacy',
      email: 'hello@cypherpunk.com'
    },
    subject: subject,
    templateId: templateIds.transactional,
    substitutions: {
      titleText: '',
			regularText: regularText,
			buttonText: 'ACCEPT MY INVITATION',
			buttonURL: common.generateActivateInvitationUrl(args.id, args.recoveryToken)
    }
  })
  .then(() => { console.log('Sent invitation confirmation email to: ' + args.to); });
}

module.export = teaserShare;
