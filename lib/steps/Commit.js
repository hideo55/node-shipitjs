var exec = require('child_process').exec;
var fs = require('fs');
var async = require('async');
var _ = require('underscore')._;

exports.getExecutor = function(state) {
  var createDiffTasks = function(files) {
    var vc = state.getVc();
    var tasks = new Array();
    _.each(files, function(file) {
      tasks.push(function(buf, cb) {
        vc.localDiff(file, function(err, data) {
          if(err)
            return cb(err);
          buf += data;
          cb(null, buf);
        });
      });
    });
    return tasks;
  };
  return function(cb) {
    var version = state.getVersion();
    var msg = "Checking in changes prior to tagging of version " + version + ".\n\nChangelog diff is:\n\n";
    var changeLogs = state.getChangeLogFiles();
    var tasks = createDiffTasks(changeLogs);
    var vc = state.getVc();

    var superCb = cb;

    tasks.unshift(function(cb) {
      var buf = '';
      cb(null, buf);
    });
    tasks.push(function(buf, cb) {
      msg += buf;
      if(state.isDryRunMode()) {
        console.log("*** DRY RUN: commit message: " + msg);
        superCb(null);
      } else {
        vc.commit(msg, function(err) {
          superCb(err);
        });
      }
    });
    async.waterfall(tasks, function(err) {
      if(err)
        return superCb(err);
    });
  };
};
