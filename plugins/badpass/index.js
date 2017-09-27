const crypto = require('crypto');
const BigInteger = require('./jsbn');
const convert = require('./convert');

let digest = function(obj, hash, encoding) {
  var digest, digestBI;
  var shasum;

  hash = hash || 'sha256';
  encoding = encoding || 'base32';

  shasum = crypto.createHash(hash);

  if (typeof obj == 'object') { shasum.update(JSON.stringify(obj)); }
  else { shasum.update(obj); }

  if (encoding == 'base32') {
    digest = shasum.digest();
    digestBI = new BigInteger(digest);
    return convert.biToBase32(digestBI, undefined, 51);
  }
  else { return shasum.digest(encoding); }
};

let salthash = function(plaintext, encoding, salt) {
  var nugget, s;

  encoding = encoding || undefined;
  salt = salt || 'angelheaded hipsters burning for the ancient heavenly connection to the starry dynamo in the machinery of night';

  nugget = (function() {
    var i, len, ref, results;
    ref = salt.split(' ');
    results = [];
    for (i = 0, len = ref.length; i < len; i++) {
      s = ref[i];
      results.push(s + plaintext);
    }
    return results;
  })();

  return digest(nugget, undefined, encoding);
};

module.exports = {
  hash: salthash
};
