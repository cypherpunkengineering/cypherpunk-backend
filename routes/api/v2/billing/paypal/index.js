const PayPal = require('paypal-nvp-api');
const PayPalConfig = require('../../../../../configs/billing').paypal;

const pp = PayPal(PayPalConfig);

module.exports = {

  generatePayPalSubscribeButton({ plan, name, price, period, delay = 0 }) {
    return Promise.resolve().then(() => {
      if (typeof price === 'number') price = price.toFixed(2);
      if (typeof delay === 'string') delay = Number.parseInt(delay);
    }).then(() => pp.request('BMCreateButton', Object.assign({
        BUTTONCODE: 'ENCRYPTED',
        BUTTONTYPE: 'SUBSCRIBE',
        BUTTONSUBTYPE: 'SERVICES',
        BUTTONCOUNTRY: 'US',
      }, paypalNumberedVariables('L_BUTTONVAR', [
        'bn=CypherpunkPrivacy_Subscribe_' + plan + '_US',
        'item_name=' + name,
        'item_number=' + plan,
        'business=' + PayPalConfig.email,
        'currency_code=USD',
        'src=1',
        //'srt=12',
        'sra=1',
        'no_note=1',
        'no_shipping=1',
        'custom=F223ZGFKANHGFIJI4IN2ETN4TZ3MAVEMTQMUSTF2ZGGYWNN55TZ/monthly',
        //'modify=1',
        'notify_url=' + server + '/api/paypal/ipn',
        'cancel_return=' + server + '/landing/paypal/cancel',
        'return=' + server + '/landing/paypal/return',
        'a3=' + price,
        'p3=' + period,
        't3=M',
      ].concat(delay ? delay > 90 ? [ 'a1=0', 'p1='+Math.floor(delay/7).toFixed(), 't1=W' ] : [ 'a1=0', 'p1='+delay.toFixed(), 't1=D' ] : []))))
    ).then(result => {
      if (result.ACK === 'Success') {
        let m = result.WEBSITECODE.match(/^<form action="([^"]*)" method="post">\n<input type="hidden" name="cmd" value="_s-xclick">\n<input type="hidden" name="encrypted" value="([^"]*)"/);
        if (m && m[1] && m[2]) {
          return { code: result.WEBSITECODE, action: m[1], encrypted: m[2] };
        }
      }
      throw 'invalid button';
    });
  }

}

