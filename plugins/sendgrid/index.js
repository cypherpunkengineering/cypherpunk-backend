const mongo = require('./mongo');
const mailer = require('./mailer');
const message = require('./message');
const templates = require('./templates');


// handle choose which users to send this mail to
let getUsers;
if (message.users === 'all') { getUsers = mongo.allUsers(); }
else if (message.users === 'confirmed') { getUsers = mongo.confirmedUsers(); }
else if (message.users === 'unconfirmed') { getUsers = mongo.unconfirmedUsers(); }
else if (message.users === 'testUser') { getUsers = mongo.testUser(); }
else { getUsers = mongo.testUsers(); }

// handle email subject line
let subject = message.subject;
if (!subject) { throw new Error('Subject not found'); }

// handle email template to use
let templateId = templates[message.templateId];
if (!templateId) { throw new Error('TemplateId not found'); }

// handle template substitutions
let substitutions = message.substitutions;


// send email to users
getUsers.then((users) => {
  console.log(users);
  return mailer.mail({
    to: users,
    subject: subject,
    templateId: templateId,
    substitutions: substitutions
  });
})
.catch((err) => {
  console.log(err);
  console.log(err.response.body);
});
