var exec = require('child_process').exec;

exports.getExecutor = function(state) {
  return function(cb) {
    if (state.isDryRunMode()) {
      console.log('*** DRY RUN: not uploading to npm');
      cb(null);
    } else {
      exec("npm publish", function(err) {
        if (err) {
          cb(err);
        } else {
          cb(null);
        }
      });
    }
  };
};