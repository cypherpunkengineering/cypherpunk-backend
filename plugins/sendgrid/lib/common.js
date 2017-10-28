const baseUrl = 'https://cypherpunk.com/';

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
  formatDate: formatDate,
  generateConfirmationUrl: generateConfirmationUrl,
  generateAccountRecoveryUrl: generateAccountRecoveryUrl,
  generateChangeConfirmationUrl: generateChangeConfirmationUrl,
  generateActivateInvitationUrl: generateActivateInvitationUrl,
  generateTeaserConfirmationUrl: generateTeaserConfirmationUrl
};
