const bookshelf = require('../database');

let User = bookshelf.Model.extend({
  tableName: 'users',
  hasTimestamps: true
});

module.exports = User;
