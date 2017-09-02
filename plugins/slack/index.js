const IncomingWebhook = require('@slack/client').IncomingWebhook;
const generalConfig = require('../../configs/general');
const db = require('../../database');

// figure out environment
let env = generalConfig.env;

// billing channel
let billingUrl = 'https://hooks.slack.com/services/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';
let billingWebhook = new IncomingWebhook(billingUrl);

function billing(text) {
  if (env === 'DEV') { text = 'V2Server: [*TEST*] ' + text; }
  else { text = 'V2Server: [*LIVE*] ' + text; }
  billingWebhook.send(text, function(err) { // header, statusCode, body
    if (err) { console.log('Error reaching slack on billing channel:', err); }
  });
}

function count() {
  let registeredCount = db.select('count').from('user_counters').where({ type: 'registered' }).then((counter) => { return counter[0].count; });
  let confirmedCount = db.select('count').from('user_counters').where({ type: 'confirmed' }).then((counter) => { return counter[0].count; });

  Promise.all([ registeredCount, confirmedCount ])
  .then((counts) => {
    let text = `[COUNT] Currently ${counts[0]} users registered, ${counts[1]} users confirmed :alex:`;
    if (env === 'DEV') { text = 'V2Server: [*TEST*] ' + text; }
    else { text = 'V2Server: [*LIVE*] ' + text; }
    billingWebhook.send(text, function(err) {
      if (err) { console.log('Error reaching slack on billing channel:', err); }
    });
  })
  .catch((err) => { console.log('Error retrieving user counts: ', err); });
}

module.exports = {
  billing: billing,
  count: count
};
