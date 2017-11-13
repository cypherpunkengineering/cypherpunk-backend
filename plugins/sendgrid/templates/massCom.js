const mailer = require('../lib/mailer');
const templateIds = require('../templateIds');

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
    templateId: templateIds.simple,
    substitutions: args.substitutions
  })
  .then(() => { console.log('Sent Mass Communication email to: ' + args.to); });
}

module.exports = massCom;
