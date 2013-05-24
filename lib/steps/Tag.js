exports.getExecutor = function(state, conf) {
  var tmpl = require('../tmpl');
  var defaultMsg = 'Tagging version "{{version}}" using shipitjs.';

  return function(cb) {
    var version = state.getVersion();
    var msg = conf.message;

    // If message template was not a string, use default
    if ('string' !== typeof msg) {
      msg = defaultMsg;
    }

    // If message template is not empty, render it
    if (0 < msg.length) {
      msg = tmpl(msg, {
        version: version
      });
    }

    if (state.isDryRunMode()) {
      console.log('*** DRY RUN: Would have tagged version "' + version + '" with message: \n> ' + msg.replace(/\n/g, '\n> '));
      cb(null);
    } else {
      var vc = state.getVc();
      vc.tagVersion(version, msg, function(err) {
        if (err) {
          cb(err);
        } else {
          cb(null);
        }
      });
    }
  };
};
exports.getRollback = function(state) {
  return function(cb) {
    var version = state.getVersion();
    var vc = state.getVc();
    vc.deleteTag(version, cb);
  };
};
