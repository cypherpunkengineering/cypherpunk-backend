const crypto = require('crypto');
const request = require('request-promise');
const parseString = require('xml2js').parseString;
const amazonConfigs = require('../../configs/amazon');

function createStringToSign(nameValues) {
  // takes nameValues and converts it to something like this
  // AWSAccessKeyId=&Action=SetBillingAgreementDetails&AmazonBillingAgreementId=&SellerId=&SignatureMethod=HmacSHA256&SignatureVersion=2&Timestamp=2017-01-19T05%3A15%3A03Z&Version=2013-01-01"

  let i = 0;
  let str = '';
  let keys = Object.keys(nameValues).sort();
  while (i < keys.length) {
    if (i !== 0) { str += '&'; }
    str += keys[i] + '=' + nameValues[keys[i]];
    i++;
  }
  return str;
}


// I don't think this is used, nor is it tested very well
function setBillingAgreementDetails(args) {
  let endpoint = amazonConfigs.host;
  let apiPath = amazonConfigs.apiPath;
  let timestamp = new Date().toISOString();

  let amazonHeaders = {
    AWSAccessKeyId: amazonConfigs.AWSAccessKeyId,
    Action: "SetBillingAgreementDetails",
    SellerId: amazonConfigs.sellerId,
    SignatureMethod: 'HmacSHA256',
    SignatureVersion: '2',
    Timestamp: encodeURIComponent(timestamp),
    Version: '2013-01-01'
  };

  let amazonBody = {
    AmazonBillingAgreementId: args.AmazonBillingAgreementId,
    "BillingAgreementAttributes.SellerNote": args.AmazonBillingAgreementId,
    "BillingAgreementAttributes.SellerBillingAgreementAttributes.CustomInformation": args.email
  };

  let combinedObject = {};
  Object.assign(combinedObject, amazonHeaders);
  Object.assign(combinedObject, amazonBody);

  let stringToSign = 'POST\n';
  stringToSign += endpoint + '\n';
  stringToSign += apiPath + '\n';
  stringToSign += createStringToSign(combinedObject);

  let hmac = crypto.createHmac('sha256', amazonConfigs.clientSecret);
  hmac.update(stringToSign);
  let signature = hmac.digest('base64');

  console.log('stringToSign is ', stringToSign);
  console.log('signature is ', signature);

  let reqBody = '';
  Object.keys(amazonHeaders).forEach((key) => { reqBody += key + '=' + amazonHeaders[key] + '&'; });
  Object.keys(amazonBody).forEach((key) => { reqBody += key + '=' + amazonBody[key] + '&'; });
  reqBody += 'Signature=' + encodeURIComponent(signature);

  console.log('reqBody is', reqBody);

  // build query options
  return request({
    method: 'POST',
    uri: 'https://' + endpoint + apiPath + '?' + reqBody,
    header: {
      accept: '*/*',
      "content-type": 'application/x-www-form-urlencoded; charset=UTF-8'
    },
    body: reqBody
  })
  // Amazon's response is always in XML format, need to convert to js
  .then((response) => {
    // debug
    // console.log('Amazon Response: ', util.inspect(response, false, null));

    // check if non-xml response
    if (response.statusCode) { throw new Error('Error Code: ', response.statusCode); }

    // otherwise, convert from xml to js
    return parseXml(response);
  })
  .catch((err) => {
    console.log(err);
    throw new Error('Invalid Resposne from Amazon API');
  });
}


function confirmBillingAgreement(args) {
  let endpoint = amazonConfigs.host;
  let apiPath = amazonConfigs.apiPath;
  let timestamp = new Date().toISOString();

  let amazonHeaders = {
    AWSAccessKeyId: amazonConfigs.AWSAccessKeyId,
    Action: 'ConfirmBillingAgreement',
    SellerId: amazonConfigs.sellerId,
    SignatureMethod: 'HmacSHA256',
    SignatureVersion: '2',
    Timestamp: encodeURIComponent(timestamp),
    Version: '2013-01-01'
  };

  let amazonBody = { AmazonBillingAgreementId: args.AmazonBillingAgreementId };

  let combinedObject = {};
  Object.assign(combinedObject, amazonHeaders);
  Object.assign(combinedObject, amazonBody);

  let stringToSign = 'POST\n';
  stringToSign += endpoint + '\n';
  stringToSign += apiPath + '\n';
  stringToSign += createStringToSign(combinedObject);

  let hmac = crypto.createHmac('sha256', amazonConfigs.clientSecret);
  hmac.update(stringToSign);
  let signature = hmac.digest('base64');

  // console.log('stringToSign is ', stringToSign);
  // console.log('signature is ', signature);

  let reqBody = '';
  Object.keys(amazonHeaders).forEach((key) => { reqBody += key + '=' + amazonHeaders[key] + '&'; });
  Object.keys(amazonBody).forEach((key) => { reqBody += key + '=' + amazonBody[key] + '&'; });
  reqBody += 'Signature=' + encodeURIComponent(signature);

  // console.log('reqBody is ', reqBody);

  // build query options
  return request({
    method: 'POST',
    uri: 'https://' + endpoint + apiPath + '?' + reqBody,
    header: {
      Accept: '*/*',
      "content-type": 'application/x-www-form-urlencoded; charset=UTF-8'
    }
  })
  // Amazon's response is always in XML format, need to convert to js
  .then((response) => {
    // debug
    // console.log('Amazon Response: ', util.inspect(response, false, null));

    // check if non-xml response
    if (response.statusCode) { throw new Error('Error Code: ', response.statusCode); }

    // otherwise, convert from xml to js
    return parseXml(response);
  })
  // check that the response was confirmed
  .then((response) => {
    if (response.ConfirmBillingAgreementResponse.ConfirmBillingAgreementResult) { return response; }
    else { throw new Error('Billing Agreement Not Confirmed'); }
  })
  .catch((err) => {
    console.log(err);
    throw new Error('Invalid Response from Amazon API');
  });
}


function authorizeOnBillingAgreement(args) {
  let endpoint = amazonConfigs.host;
  let apiPath = amazonConfigs.apiPath;
  let timestamp = new Date().toISOString();

  let amazonHeaders = {
    AWSAccessKeyId: amazonConfigs.AWSAccessKeyId,
    Action: 'AuthorizeOnBillingAgreement',
    SellerId: amazonConfigs.sellerId,
    SignatureMethod: 'HmacSHA256',
    SignatureVersion: '2',
    Timestamp: encodeURIComponent(timestamp),
    Version: '2013-01-01'
  };

  let amazonBody = {
    AmazonBillingAgreementId: args.AmazonBillingAgreementId,
    "AuthorizationAmount.Amount": args.price,
    "AuthorizationAmount.CurrencyCode": args.currency,
    "AuthorizationReferenceId": args.authorizationReference,
    "SellerOrderAttributes.CustomInformation": args.userId,
    "CaptureNow": true,
    "TransactionTimeout": 0
  };

  let combinedObject = {};
  Object.assign(combinedObject, amazonHeaders);
  Object.assign(combinedObject, amazonBody);

  let stringToSign = 'POST\n';
  stringToSign += endpoint + '\n';
  stringToSign += apiPath + '\n';
  stringToSign += createStringToSign(combinedObject);

  let hmac = crypto.createHmac('sha256', amazonConfigs.clientSecret);
  hmac.update(stringToSign);
  let signature = hmac.digest('base64');

  let reqBody = '';
  Object.keys(amazonHeaders).forEach((key) => { reqBody += key + '=' + amazonHeaders[key] + '&'; });
  Object.keys(amazonBody).forEach((key) => { reqBody += key + '=' + amazonBody[key] + '&'; });
  reqBody += 'Signature=' + encodeURIComponent(signature);

  // build query options
  return request({
    method: 'POST',
    uri: 'https://' + endpoint + apiPath + '?' + reqBody,
    header: {
      accept: '*/*',
      "content-type": 'application/x-www-form-urlencoded; charset=UTF-8'
    }
  })
  // Amazon's response is always in XML format, need to convert to js
  .then((response) => {
    // debug
    // console.log('Amazon Response: ', util.inspect(response, false, null));

    // check if non-xml response
    if (response.statusCode) { throw new Error('Error Code: ', response.statusCode); }

    // otherwise, convert from xml to js
    return parseXml(response);
  })
  .then((body) => {
    let state = body.AuthorizeOnBillingAgreementResponse. AuthorizeOnBillingAgreementResult[0].AuthorizationDetails[0].AuthorizationStatus[0].State[0];
    if (!state || state !== 'Closed') { throw new Error('Amazon Charge Failed'); }
    else { return state; }
  })
  .catch((err) => {
    console.log(err);
    throw new Error('Invalid Response from Amazon API');
  });
}


// convert xml to javascript
function parseXml(xml) {
  return new Promise((resolve, reject) => {
    parseString(xml, function(err, result) {
      if (err) { return reject(err); }
      else { return resolve(result); }
    });
  });
}

module.exports = {
  setBillingAgreementDetails: setBillingAgreementDetails,
  confirmBillingAgreement: confirmBillingAgreement,
  authorizeOnBillingAgreement: authorizeOnBillingAgreement
};
