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
  .then(() => { console.log('Sent registration confirmation email to: ' + args.to); });
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
  .then(() => { console.log('Sent recovery email to: ' + args.to); });
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
  .then(() => { console.log('Sent email change confirmation email to: ' + args.to); });
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
  .then(() => { console.log('Sent purchase email to: ' + args.to); });
}


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
    templateId: templates.transactional,
    substitutions: {
      titleText: '',
			regularText: regularText,
			buttonText: 'ACCEPT MY INVITATION',
			buttonURL: generateActivateInvitationUrl(args.id, args.recoveryToken)
    }
  })
  .then(() => { console.log('Sent invitation confirmation email to: ' + args.to); });
}


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
    templateId: templates.transactional,
    substitutions: {
      titleText: `We've moved to a better system!`,
			regularText: 'Click the button below to set your new account password',
			buttonText: 'RESET MY PASSWORD',
			buttonURL: generateAccountRecoveryUrl(args.id, args.recoveryToken)
    }
  })
  .then(() => { console.log('Sent recovery email to: ' + args.to); });
}


/**
 * args: {
 *   to: string, (user's email)
 *   subject: string, (email subject)
 *   substitutions: {
 *     titleText: string, (email title text)
 *     regularText: string, (email regular text)
 *   }
 * }
 */
function massCom(args) {
  return mailer.mail({
    to: args.to,
    from: {
      name: 'Cypherpunk Privacy',
      email: 'hello@cypherpunk.com'
    },
    subject: args.subject,
    templateId: templates.simple,
    substitutions: args.substitutions
  })
  .then(() => { console.log('Sent Mass Communication email to: ' + args.to); });
}


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
  purchase: purchase,
  teaserShare: teaserShare,
  migration: migration,
  massCom: massCom
};
