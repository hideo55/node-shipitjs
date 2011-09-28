var exec = require('child_process').exec;
var fs = require('fs');
var path = require('path');

exports.getExecutor = function(state, options) {
  var origin, branch;
  if (options && typeof options == 'Object') {
    origin = options.origin;
    branch = options.branch;
  }
  if (!origin)
    origin = 'origin';
  if (!branch)
    branch = 'master';

  return function(cb) {
    if (state.isDryRunMode()) {
      console.log('*** DRY RUN: Will be exec: git push ' + origin + ' ' + branch);
      cb(null);
    } else {
      exec('git push ' + origin + ' ' + branch, function(err) {
        if (err) {
          cb(err);
        } else {
          cb(null);
        }
      });
    }
  };
};