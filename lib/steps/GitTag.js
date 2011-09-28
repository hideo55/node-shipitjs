var exec = require('child_process').exec;
var fs = require('fs');
var path = require('path');

exports.getExecutor = function(state) {
  return function(cb) {
    var version = state.getVersion();
    if (state.isDryRunMode()) {
      console.log('*** DRY RUN: Will be exec: git tag ' + version);
      cb(null);
    } else {
      exec("git tag " + version, function(err) {
        if (err) {
          cb(err);
        } else {
          cb(null);
        }
      });
    }
  };
};