var exec = require('child_process').exec;

exports.getExecutor = function(state) {

  var boolPrompt = require('../util').getBoolPrompt(state);

  return function(cb) {
    boolPrompt('Publish to NPM?', 'n', function(ans) {
      if (ans) {
        if (state.isDryRunMode()) {
          console.log('*** DRY RUN: not uploading to NPM.');
          cb(null);
        } else {
          exec("npm publish", function(err) {
            if (err)
              return cb(err);
            cb(null);
          });
        }
      } else {
        cb(new Error("Aborting."));
      }
    });
  };
};
