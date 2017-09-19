const db = require('../../database');
const mailer = require('../../plugins/sendgrid');


function saveUsers() {
  return db.select(['id', 'email', 'recovery_token'])
  .from('users')
  .where({ 'password': null })
  .then((users) => {
    console.log(`Emailing ${users.length}  users with password reset email`);
    let timer = 0;

    users.forEach((user) => {
      timer = timer + 100;
      setTimeout(() => {
        console.log(`sending email to ${user.email}:${user.recovery_token}`);
        let msg = { to: user.email, id: user.id, recoveryToken: user.recovery_token };
        // mailer.migration(msg);
      }, timer);
    });
  });
}

saveUsers();
