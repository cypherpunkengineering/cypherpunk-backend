const mailer = require('./mailer');
const templates = require('./templates');
const baseUrl = 'https://cypherpunk.com/';

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
    templateId: templates.transactional,
    substitutions: {
      titleText: `You're only one step away`,
			regularText: 'Click the button below to confirm your free trial to Cypherpunk Privacy',
			buttonText: 'ACTIVATE MY ACCOUNT',
			buttonURL: generateConfirmationUrl(args.id, args.confirmationToken)
    }
  })
  .then(() => { console.log('Sent confirmation email to: ' + args.to); });
}

// TODO: add mass mailer functions here

/** Utility Functions **/

function generateConfirmationUrl(id, confirmationToken) {
	return baseUrl + `confirm?accountId=${id}&confirmationToken=${confirmationToken}`;
}

function generateActivateInvitationUrl(id, recoveryToken) {
	return baseUrl + `activate?accountId=${id}&recoveryToken=${recoveryToken}`;
}

function generateChangeConfirmationUrl(id, pendingEmailToken) {
	return baseUrl + `confirmChange?accountId=${id}&confirmationToken=${pendingEmailToken}`;
}

function generateAccountRecoveryUrl(id, recoveryToken) {
	return baseUrl + `reset?accountId=${id}&recoveryToken=${recoveryToken}`;
}

function generateTeaserConfirmationUrl(id, confirmationToken) {
	return baseUrl + `confirmation?accountId=${id}&confirmationToken=${confirmationToken}`;
}


module.exports = {
  registration: registration
};
