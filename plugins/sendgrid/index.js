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
    templateId: templates.transactional,
    substitutions: {
      titleText: 'Reset your account password',
			regularText: 'Click the button below to set your new account password',
			buttonText: 'RESET MY PASSWORD',
			buttonURL: generateAccountRecoveryUrl(args.id, args.recoveryToken)
    }
  })
  .then(() => { console.log('Sent confirmation email to: ' + args.to); });
}

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
    templateId: templates.transactional,
    substitutions: {
      titleText: `You're almost done...`,
			regularText: 'Click the button below to confirm your new email address',
			buttonText: 'CONFIRM MY EMAIL',
			buttonURL: generateChangeConfirmationUrl(args.id, args.pendingEmailToken)
    }
  })
  .then(() => { console.log('Sent confirmation email to: ' + args.to); });
}


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
    templateId: templates.purchase,
    substitutions: {
      userEmail: args.to,
			subscriptionPrice: args.subscriptionPrice,
			subscriptionRenewal: args.subscriptionRenewal,
			subscriptionExpiration: formatDate(args.subscriptionExpiration)
    }
  })
  .then(() => { console.log('Sent confirmation email to: ' + args.to); });
}




// TODO: add mass mailer functions here

/** Utility Functions **/

function formatDate(date) {
  let monthNames = [
    'January', 'February', 'March',
    'April', 'May', 'June', 'July',
    'August', 'September', 'October',
    'November', 'December'
  ];

  let day = date.getDate();
  let monthIndex = date.getMonth();
  let year = date.getFullYear();

  return day + ' ' + monthNames[monthIndex] + ' ' + year;
}

function generateConfirmationUrl(id, confirmationToken) {
	return baseUrl + `confirm?accountId=${id}&confirmationToken=${confirmationToken}`;
}

function generateAccountRecoveryUrl(id, recoveryToken) {
  return baseUrl + `reset?accountId=${id}&recoveryToken=${recoveryToken}`;
}

function generateChangeConfirmationUrl(id, pendingEmailToken) {
  return baseUrl + `confirmChange?accountId=${id}&confirmationToken=${pendingEmailToken}`;
}

function generateActivateInvitationUrl(id, recoveryToken) {
	return baseUrl + `activate?accountId=${id}&recoveryToken=${recoveryToken}`;
}

function generateTeaserConfirmationUrl(id, confirmationToken) {
	return baseUrl + `confirmation?accountId=${id}&confirmationToken=${confirmationToken}`;
}


module.exports = {
  registration: registration,
  recovery: recovery,
  changeEmail: changeEmail,
  purchase: purchase
};
