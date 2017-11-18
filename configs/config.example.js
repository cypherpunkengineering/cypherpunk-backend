module.exports = {
  env: 'DEV', // 'DEV', 'PROD', 'STAGING'
  host: 'localhost', // 'localhost'
  address: '127.0.0.1', // '0.0.0.0'
  port: 11080, // 11080
  tls: { // { cert: '<file contents>', key: '<file contents>' }
    cert: '',
    key: ''
  },
  // logging
  logging: {
    reporters: {
      console: [{
        module: 'good-squeeze',
        name: 'Squeeze',
        args: [{ response: '*', log: '*' }]
      },
      { module: 'good-console' },
      'stdout'],
      myFileReporter: [{
        module: 'good-squeeze',
        name: 'Squeeze',
        args: [{ response: '*', log: '*' }]
      },
      {
        module: 'good-squeeze',
        name: 'SafeJson'
      },
      {
        module: 'good-file',
        args: ['./logs/cypher-log']
      }]
    }
  },
  // third party configs
  amazon: {
    host: 'mws.amazonservices.com',
    apiPath: '/OffAmazonPayments_Sandbox/2013-01-01', // /OffAmazonPayments/2013-01-01
    AWSAccessKeyId: 'AKIAJKYFSJU7PEXAMPLE',
    sellerId: '',
    clientSecret: ''
  },
  mongo: {
    uri: 'mongodb://localhost:27017/cypherpunk'
  },
  paypal: {
    mode: 'sandbox', // or 'live'
    username: 'paypaltest-facilitator_api1.cypherpunk.com',
    password: '2G5DED9AQG89VHFF',
    signature: 'AFcWxV21C7fd0v3bYYYRCpSSRl31AT4Qw6mnjObFqqu.R8a7.GIe7pPa',
    email: 'paypaltest-facilitator@cypherpunk.com'
  },
  sendgrid: {
    disabled: false,
    key: 'apikey',
    from: {
      name: 'Cypherpunk Privacy',
      email: 'hello@cypherpunk.com'
    }
  },
  slack: {
    billingUrl: 'https://hooks.slack.com/services/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',
    disabled: false
  },
  stripe: {
    secret_key: '',
    endpoint_secret: ''
  }
};
