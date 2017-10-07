const config = require('../configs/mongo');
const MongoClient = require('mongodb').MongoClient;
const uri = config.uri;

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
  console.log('Total number of users: ');
  console.log(users.length);
  return users;
})
// print stats
.then((users) => {
  users.forEach((user) => {
    let created = new Date(user.created);
    let userData = user.data;

    // ignore broken ata
    if (!created || !userData) { return console.log('Broken User Data'); }

    let createdString = created.getUTCFullYear();
    createdString += '/';
    createdString += created.getUTCMonth() + 1;
    createdString += '/';
    createdString += created.getUTCDate();

    let userConfirmed = user.data.confirmed;

    console.log('User Created: ', createdString, ' Confirmed: ' + userConfirmed);
  });

  // close mongo db connection
  return db.close();
})
.catch((e) => {
  db.close();
  console.log(e);
});
