var exec = require('child_process').exec;

exports.getExecutor = function(state) {
  
  var boolPrompt = require('../util').getBoolPrompt(state);
  
  return function(cb) {
    boolPrompt('Publish to NPM?', 'y', function(ans) {
      if(ans) {
        if(state.isDryRunMode()) {
          console.log('*** DRY RUN: not uploading to npm.');
          cb(null);
        } else {
          exec("npm publish", function(err) {
            if(err) {
              cb(err);
            } else {
              cb(null);
            }
          });
        }
      } else {
        cb(new Error("Aborting."));
      }
    });
  };
};
