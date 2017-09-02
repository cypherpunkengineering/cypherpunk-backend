module.exports = {

  development: {
    stripe: {

    },
    paypal: {
      mode: 'sandbox',
      username: 'paypaltest-facilitator_api1.cypherpunk.com',
      password: '2G5DED9AQG89VHFF',
      signature: 'AFcWxV21C7fd0v3bYYYRCpSSRl31AT4Qw6mnjObFqqu.R8a7.GIe7pPa',
      email: 'paypaltest-facilitator@cypherpunk.com',
      ipn: 'ipnpb.sandbox.paypal.com',  
    },
  },

  production: {
    stripe: {

    },
    paypal: {
      mode: 'live',
      ipn: 'ipnpb.paypal.com',
    },
  },

}[(process.env.NODE_ENV || 'development').toLowerCase()]
