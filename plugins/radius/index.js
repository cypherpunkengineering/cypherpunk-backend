const db = require('../../database');
const crypto = require('crypto');

const DEFAULT_GROUP_PRIORITIES = {
  'free': 9000,
};

function nthash(str) {
  let md4 = crypto.createHash('md4');
  md4.update(new Buffer(str, 'ucs2'));
  return md4.digest('hex').toUpperCase();
}

function makeRandomString(length = 26) {
  return crypto.randomBytes((length + 1) >> 1).toString('hex').toUpperCase().slice(0, length);
}

function addRadiusToken(userId, tokenUsername, tokenPassword) {
  return db.insert({
    account: userId,
    username: tokenUsername,
    attribute: 'NT-Password',
    op: ':=',
    value: nthash(tokenPassword),
  }).into('radius_tokens');
}

function removeRadiusToken(userId) {
  return db('radius_tokens').where('account', userId).del();
}

function updateRadiusTokenPassword(userId, newTokenPassword) {
  return db('radius_tokens').where('account', userId).update({
    attribute: 'NT-Password',
    op: ':=',
    value: nthash(newTokenPassword),
  });
}

function addRadiusTokenGroup(tokenUsername, group, priority) {
  return db.insert({
    username: tokenUsername,
    groupname: group,
    priority: priority || DEFAULT_GROUP_PRIORITIES[group] || 9000,
  }).into('radius_token_groups');
}

function removeRadiusTokenGroup(tokenUsername, group) {
  let query = db('radius_token_groups').where('username', tokenUsername);
  if (typeof group !== 'undefined') {
    query = query.where('groupname', group);
  }
  return query.del();
}

module.exports = {
  addToken: addRadiusToken,
  removeToken: removeRadiusToken,
  updateTokenPassword: updateRadiusTokenPassword,
  addTokenGroup: addRadiusTokenGroup,
  removeTokenGroup: removeRadiusTokenGroup,
  makeRandomString,
};
