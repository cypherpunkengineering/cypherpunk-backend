const IncomingWebhook = require('@slack/client').IncomingWebhook;
const generalConfig = require('../../configs/general');

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

module.exports = {
  billing: billing
};
