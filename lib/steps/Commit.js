var fs = require('fs');
var async = require('async');
var _ = require('underscore')._;

exports.getExecutor = function(state) {
  var createDiffTasks = function(files, cb) {
    var vc = state.getVc();
    var tasks = [];
    var curVersion = state.getCurrentVersion();
    vc.existsTaggedVersion(curVersion, function(err, tag) {
      var diffTarget;
      if (tag) {
        diffTarget = tag;
      } else {
        diffTarget = 'HEAD';
      }
      _.each(files, function(file) {
        tasks.push(function(buf, cb) {
          vc.localDiff(file, diffTarget, function(err, data) {
            if (err)
              return cb(err);
            buf += data;
            cb(null, buf);
          });
        });
      });
      return cb(null, tasks);
    });
  };
  return function(cb) {
    var version = state.getVersion();
    var msg = 'Checking in changes prior to tagging version "' + version + '".\n\nChangelog diff:\n\n';
    var changeLogs = state.getChangeLogFiles();
    var vc = state.getVc();

    var superCb = cb;

    var tasks = createDiffTasks(changeLogs, function(err, tasks) {
      tasks.unshift(function(cb) {
        var buf = '';
        cb(null, buf);
      });
      tasks.push(function(buf, cb) {
        msg += buf;
        if (state.isDryRunMode()) {
          console.log('*** DRY RUN: Would have used commit message: \n> ' + msg.replace(/\n/g, "\n> "));
          superCb(null);
        } else {
          vc.commit(msg, function(err) {
            superCb(err);
          });
        }
      });
      async.waterfall(tasks, function(err) {
        if (err)
          return superCb(err);
      });
    });
  };
};
exports.getRollback = function(state) {
  return function(cb) {
    var vc = state.getVc();
    vc.resetRecentCommit(cb);
  };
};
