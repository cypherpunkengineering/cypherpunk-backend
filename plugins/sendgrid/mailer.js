const config = require('./config');
const mailer = require('@sendgrid/mail');

mailer.setApiKey(config.sendgrid.key);
mailer.setSubstitutionWrappers('-', '-');

function validate(arg) {
  let value = { valid: false, error: false };

  // arg.to === email (string || array of strings)
  if (Array.isArray(arg.to) && arg.to.length < 1) { value.error = 'To field required'; }
  else if (!arg.to) { value.error = 'To field required'; }
  if (value.error) { return value; }

  // subject must be a valid string
  if (!arg.subject) { value.error = 'Subject field required'; }
  if (value.error) { return value; }

  // templateId must be a valid string
  if (!arg.templateId) { value.error = 'TemplateId required'; }
  if (value.error) { return value; }

  if (!value.error) { value.valid = true; }
  return value;
}

function mail(arg) {
  let valid = validate(arg);

  let msg = {
    to: arg.to,
    from: {
      name: config.from.name,
      email: config.from.email,
    },
    subject: arg.subject,
    substitutions: arg.substitutions,
    templateId: arg.templateId,
    html: 'true',
    header: {
      'X-Accept-Language': 'en',
      'X-Mailer': 'CypherpunkPrivacyMail'
    }
  }

  console.log('Emailing: ', msg);

  return mailer.send(msg);

  if (valid.valid) { return mailer.send(msg); }
  else { return Promise.reject(valid.error); }
}

module.exports = {
  mail: mail
}
