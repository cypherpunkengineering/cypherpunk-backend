const BigInteger = require('./jsbn');

module.exports = (function() {
  function convert() {}

  convert.base32charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

  convert.modhexcharset = 'cbdefghijklnrtuv';

  convert.modhex2hex_mapping = {
    c: '0',
    b: '1',
    d: '2',
    e: '3',
    f: '4',
    g: '5',
    h: '6',
    i: '7',
    j: '8',
    k: '9',
    l: 'A',
    n: 'B',
    r: 'C',
    t: 'D',
    u: 'E',
    v: 'F'
  };

  convert.hex2ascii = function(str) {
    var ascii_string, bytes, c, i, j, ref;
    bytes = [];
    for (c = j = 0, ref = str.length; j < ref; c = j += 2) {
      bytes.push(parseInt(str.substr(c, 2), 16));
    }
    ascii_string = new String();
    for (i in bytes) {
      ascii_string += String.fromCharCode(bytes[i]);
    }
    return ascii_string;
  };

  convert.ascii2hex = function(str) {
    var hex_string, i;
    hex_string = '';
    for (i in str) {
      hex_string += str.charCodeAt(i).toString(16);
    }
    return hex_string;
  };

  convert.hex2modhex = function(str) {
    var h, j, len, out, s;
    out = '';
    for (j = 0, len = str.length; j < len; j++) {
      s = str[j];
      h = parseInt(s, 16);
      if (isNaN(h)) {
        h = 0;
      }
      out += convert.modhexcharset[h];
    }
    return out;
  };

  convert.modhex2hex = function(str) {
    var c, j, len, out, s;
    out = '';
    console.log(str);
    for (j = 0, len = str.length; j < len; j++) {
      s = str[j];
      c = convert.modhex2hex_mapping[s];
      if (c == null) {
        c = convert.modhexcharset[0];
      }
      out += c;
    }
    return out;
  };

  convert.biToBase32 = function(n, charset, length) {
    var base, d, out, r;
    if (charset == null) {
      charset = convert.base32charset;
    }
    if (length == null) {
      length = -1;
    }
    n = n.abs();
    base = new BigInteger('32');
    out = '';
    while (true) {
      d = n.divideAndRemainder(base);
      n = d[0];
      r = d[1];
      out = charset.charAt(r) + out;
      if (n.compareTo(base) < 0) {
        out = charset.charAt(n) + out;
        break;
      }
    }
    if (length > 0) {
      out = convert.padFront(out, length, charset[0]);
    }
    return out;
  };

  convert.num2base = function(number, base, symbols, position, result) {
    var remainder;
    if (position == null) {
      position = 0;
    }
    if (result == null) {
      result = '';
    }
    if (number < Math.pow(base, position + 1)) {
      return symbols[number / Math.pow(base, position)] + result;
    }
    remainder = number % Math.pow(base, position + 1);
    return convert.num2base(number - remainder, base, symbols, position + 1, symbols[remainder / (Math.pow(base, position))] + result);
  };

  convert.num2base32 = function(number, length) {
    var b32, b32padded;
    b32 = convert.num2base(number, 32, convert.base32charset);
    b32padded = convert.padBack(number, length, '=');
    return b32padded;
  };

  convert.num2wiz32 = function(number, length) {
    var wiz32, wiz32padded;
    wiz32 = convert.num2base(number, 32, convert.base32charset);
    wiz32padded = convert.padFront(wiz32, length, convert.base32charset[0]);
    return wiz32padded;
  };

  convert.padFront = function(number, length, padchar) {
    while (number.length < length) {
      number = padchar + number;
    }
    return number;
  };

  convert.padBack = function(number, length, padchar) {
    while (number.length < length) {
      number = number + padchar;
    }
    return number;
  };

  return convert;

})();
