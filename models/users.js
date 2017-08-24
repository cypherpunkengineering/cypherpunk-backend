const bookshelf = require('../database');

// id: uuid - Primary key
// email: string - unique - not null
// password: string
// type: string
// created_at: timestamp with time zone
// updated_at: timestamp with time zone
// confirmed: boolean
// confirmationToken: string
// recoveryToken: string
// pendingEmail: string - unique
// pendingEmailConfirmationToken: string
// referralID: string
// referralName: string
// privacy_username: string
// privacy_password: string

let User = bookshelf.Model.extend({
  tableName: 'users',
  hasTimestamps: true
});

module.exports = User;
