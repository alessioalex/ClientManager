var moment = require('moment'),
    _      = require('underscore');

module.exports = function(opts) {
  return function(val) {
    var born;

    if (!val) { return false; }
    if (opts.isEmail && !(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(val))) {
      return false;
    }
    if (opts.length && opts.length.min && opts.length.min !== 0 && opts.length.max) {
      if (val.length < opts.length.min || val.length > opts.length.max) { return false; }
    }
    if (opts.minAge) {
      born = moment(val);
      // calculate the duration between the current time and the date passed
      if (moment.duration(moment().diff(born)).years() < 18) {
        return false;
      }
    }

    return true;
  };
};
