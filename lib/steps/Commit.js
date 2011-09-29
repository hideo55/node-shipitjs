var exec = require('child_process').exec;
var fs = require('fs');
var path = require('path');
var async = require('async');
var _ = require('underscore')._;

exports.getExecutor = function(state) {
  return function(cb) {
    var version = state.getVersion();
    var msg = "Checking in changes prior to tagging of version " + version + ".\n\nChangelog diff is:\n\n";
    var vc = state.getVc();
    var changeLogs = state.getChangeLogFiles();
    var tasks = createDiffTasks(vc, changeLogs);
    
    var superCb = cb;
    
    tasks.unshift(function(cb) {
      var buf = '';
      cb(null, buf);
    });
    tasks.push(function(msg, cb) {
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
var createDiffTasks = function(vc, files) {
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
