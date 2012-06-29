var toBool = function(yn) {
  if (yn.match(/^y/i))
    return true;
  if (yn.match(/^n/i))
    return false;
  return null;
};
exports.getBoolPrompt = function(state) {
  var boolPrompt = function(msg, defaultVal, cb) {
    var i = state.getReadlineInterface();
    var expect = '';
    if (defaultVal.match(/^y/i)) {
      expect = '[Y/n]';
    } else if (defaultVal.match(/^n/i)) {
      expect = '[y/N]';
    } else {
      cb(new Error('bogus default'));
    }

    i.question(msg + expect, function(ans) {
      var yn = toBool(ans || defaultVal);
      if (yn) {
        return cb(true);
      } else if (yn === false) {
        return cb(false);
      } else {
        console.warn("Please answer 'y' or 'n'");
        boolPrompt(msg, defaultVal, cb);
      }
    });
  };
  return boolPrompt;
};
