const pg = require('../../database');
const randToken = require('rand-token');
const mongoConfigs = require('../../configs').mongo;
const radius = require('../../plugins/radius');
const MongoClient = require('mongodb').MongoClient;
const uri = mongoConfigs.uri;

let keys = new Set();
let dataKeys = new Set();
let testKeys = new Set();

let skippedUsers = [];
let cypherUsers = [
  'mike@cypherpunk.com',
  'jon@cypherpunk.com',
  'kim@cypherpunk.com',
  'ed@cypherpunk.com',
  'andrei@cypherpunk.com',
  'expired@cypherpunk.com',
  'expires@cypherpunk.com',
  'renews@cypherpunk.com',
  'free@cypherpunk.com',
  'trial@cypherpunk.com',
  'andra@cypherpunk.com',
  'chris@cypherpunk.com',
  'nothankyou@cypherpunk.com',
  'aurel@cypherpunk.com',
  'tony@cypherpunk.com'
];


// things work considering
// should we keep the id?
// how do we handle pUsername and pPassword? (email to tell them their account changed?)
// how do we handle new password?

// things to preserve
// id (regenerate)
// type ['free', 'developer', 'invitation', 'trial', 'premium', 'expired', 'staff', 'pending']
// data (skip if not exists)
// confirmationToken (if exists)
// privacy --
// updated (port)
// created (port)
// lastLoginTS (if exists)
// pendingEmail (if exists)
// pendingEmailConfirmationToken (if exists)
// recoveryToken (if exists)

// privacy username (regenerate and if confirmed, email)
// privacy password (regenerate and if confirmed, email)

// data email
// data confirmed
// data password (can't port)
// data stripeCustomerId (always there)
// data paypalSubscriptionId (ignore)
// data amazonSubscriptionId (ignore)
// data subscriptionCurrentID (always there but only one real)
// referralID (if exists)
// referralName (if exists)
// signupPriority (set to one)
// subscriptionActive (port if exists, 3)
// subscriptionExpiration (port if exists, 3)
// subscriptionRenewal (port if exists, 3)
// subscriptionRenews (port if exists, 3)
// subscriptionType (port if exists, 3)

// create connection to mongo db
let db;
return new Promise((resolve, reject) => {
  MongoClient.connect(uri, function(err, mongoDb) {
    if (err) { return reject(err); }
    else { return resolve(mongoDb); }
  });
})
// hold on to mongo db connection
.then((connection) => { db = connection; })
// query for all users
.then(() => { return db.collection('user').find().toArray(); })
// port each user
.then((users) => {
  users.forEach(portUser);
  return users;
})
// stat each user
.then((users) => {
  users.forEach(statUser);
  return users;
})
// print stats
.then((users) => {
  console.log('Shape of User: ', keys, '\n\n');
  console.log('Shape of User Data: ', dataKeys, '\n\n');
  console.log('Total Number of users processed: ', users.length);

  console.log('Total Number of users skipped: ', skippedUsers.length);
  console.log('Skipped Users: ');
  skippedUsers.forEach((user) => { console.log(user); });

  // close mongo db connection
  return db.close();
})
// update counts
.then(updateCounts)
// error handling
.catch((e) => {
  db.close();
  console.log(e);
});


function statUser(user) {
  Object.keys(user).forEach((key) => {
    keys.add(key);
  });

  if (user.data) {
    Object.keys(user.data).forEach((key) => {
      dataKeys.add(key);
    });
  }

  if (user.data) {
    testKeys.add(user.data.confirmed);
  }

  // if (user.data && user.data.subscriptionCurrentID && user.data.subscriptionCurrentID !== '0') {
  //   subId = user.data.subscriptionCurrentID;
  // }

  // if (user.data && user.data.signupPriority) {
  //   testKeys.add(user.data.signupPriority);
  // }
}

function portUser(user) {
  // skip if no user data
  if (!user.data) { return skippedUsers.push(user); }

  // skip cypherpunk test accounts
  let skip = false;
  if (user.data.email.endsWith('@cypherpunk.com')) {
    if (!cypherUsers.includes(user.data.email)) { skip = true; }
  }
  if (skip) { return skippedUsers.push(user); }

  // handle user type
  if (user.type === 'trial') { user.type = 'free'; }

  // handle user confirmed
  if (user.data.confirmed && user.data.confirmed === 'true') {
    user.confirmed = true;
  }
  else if (user.data.confirmed && user.data.confirmed === 'false') {
    user.confirmed = false;
  }

  // create new user
  let newUser = {
    email: user.data.email.toLowerCase(),
    password: user.data.password,
    type: user.type,
    priority: 1,
    confirmed: user.data.confirmed,
    created_at: new Date(user.created),
    pending_email: user.pendingEmail,
    pending_email_confirmation_token: user.pendingEmailConfirmationToken,
    confirmation_token: user.confirmationToken,
    recovery_token: user.recoveryToken || randToken.generate(32)
  };

  // handle last login for this user
  if (user.lastLoginTS) {
    newUser.last_login = new Date(user.lastLoginTS);
  }

  // handle conf_token if confirmed
  if (newUser.confirmed) { delete newUser.confirmation_token; }

  // insert new user
  let pgUser;
  return pg.insert(newUser).into('users').returning('*')
  .then((data) => { pgUser = data[0]; })
  .then(() => { return generateRadius(pgUser); }) // create radius account
  .catch((e) => {
    console.log('Could not generate account for: ', user.data.email);
    console.log(e);
  });
}

function generateRadius(pgUser) {
  let username = radius.makeRandomString(26),
      password = radius.makeRandomString(26);
  return radius.addToken(pgUser.id, username, password)
  .then(() => { return radius.addTokenGroup(username, pgUser.type); })
  .catch((e) => {
    console.log('Could not generate radius account for: ', pgUser.id);
    console.log(e);
  });
}

function updateCounts() {
  return pg('users').count()
  .then((result) => {
    if (!result.length) { throw new Error('No Users Found?'); }
    result = result[0];

    // print out the number of registered users
    console.log(result.count, ' Users Imported!!!');

    // update registered users count
    return pg('user_counters').where({ type: 'registered' }).update({ count: result.count });
  })
  .then(() => {
    return pg('users').count('confirmed').where({ confirmed: true })
    .then((result) => {
      if (!result.length) { throw new Error('No Confirmed Users?'); }
      result = result[0];

      // print out the number of confirmed users
      console.log(result.count, ' Confirmed Users!!!');

      // update confirmed users count
      return pg('user_counters').where({ type: 'confirmed' }).update({ count: result.count });
    });
  });
}


// how do we handle pUsername and pPassword? (email to tell them their account changed?)
