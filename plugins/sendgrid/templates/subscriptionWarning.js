const crypto = require('crypto');
const mailer = require('../lib/mailer');
const templateIds = require('../templateIds');

/**
 * args: {
 *   days: number, (the subscription warning day of),
 *   to: string, (user's email)
 * }
 */
function subscriptionWarning(args) {
  return mailer.mail({
    to: args.to,
    from: {
      name: 'Cypherpunk Privacy',
      email: 'hello@cypherpunk.com'
    },
    subject: generateSubject(args.days),
    templateId: templateIds.simple,
    substitutions: generateSubstitutions(args.to, args.days)
  })
  .then(() => { console.log('Sent Subscription Warning email to: ' + args.to); });
}

function generateSubject(days) {
  if (days === 1) { return 'Please Upate Payment Info'; }
  else if (days === 4) { return 'Please Upate Payment Info'; }
  else if (days === 9) { return 'Please Upate Payment Info'; }
  else if (days === 12) { return 'Please Upate Payment Info'; }
  else if (days === 15) { return 'Please Buy Another Subscription'; }
  else if (days === 16) { return 'Account Downgraded'; }
}

function generateSubstitutions(email, days) {
  let title, regular;
  if (days === 1) { title = 'Please Upate Payment Info'; }
  else if (days === 4) { title = 'Please Upate Payment Info'; }
  else if (days === 9) { title = 'Please Upate Payment Info'; }
  else if (days === 12) { title = 'Please Upate Payment Info'; }
  else if (days === 15) { title = 'Please Buy Another Subscription'; }
  else if (days === 16) { title = 'Account Downgraded'; }

  if (days === 1) { regular = 'Please Upate Payment Info'; }
  else if (days === 4) { regular = 'Please Upate Payment Info'; }
  else if (days === 9) { regular = 'Please Upate Payment Info'; }
  else if (days === 12) { regular = 'Please Upate Payment Info'; }
  else if (days === 15) { regular = 'Please Buy Another Subscription'; }
  else if (days === 16) { regular = 'Account Downgraded'; }

  // generate unsub link
  let token = encrypt(email);
  let unsub = `https://cypherpunk.com/unsubscribe?email=${email}&token=${token}`;

  return {
    titleText: '',
    regulatText: '',
    unsubLink: unsub
  };
}

function encrypt(text){
  var cipher = crypto.createCipher('aes-256-ctr', 'jsucksballsformakingmedothisshit');
  var crypted = cipher.update(text,'utf8','hex');
  crypted += cipher.final('hex');
  return crypted;
}


module.exports = subscriptionWarning;
