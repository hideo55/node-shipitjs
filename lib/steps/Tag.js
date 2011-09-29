var exec = require('child_process').exec;
var fs = require('fs');
var path = require('path');

exports.getExecutor = function(state) {
  return function(cb) {
    var version = state.getVersion();
    if (state.isDryRunMode()) {
      console.log('*** DRY RUN: Would have tagged version ' + version + ".");
      cb(null);
    } else {
      var vc = state.getVc();
      var msg = "Tagging version '" + version + "' using shipitjs.";
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