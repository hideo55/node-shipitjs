var exec = require('child_process').exec;
var fs = require('fs');
var path = require('path');
var async = require('async');
var temp = require('temp');
var _ = require('underscore')._;

exports.getExecutor = function(state) {
  return function(cb) {
    var version = state.getVersion();
    var msg = "Checking in changes prior to tagging of version " + version
        + ".¥n¥nChangelog diff is:¥n¥n";

    var superCb = cb;

    var changeLogs = state.getChangeLogFiles();

    var tasks = createTasks(changeLogs);
    var buf = '';
    tasks.unshift(function(cb) {
      var buf = '';
      cb(null, buf);
    });
    tasks.push(function(buff, cb) {
      msg += buf;
      temp.open('tmpgitcomment', function(err, info) {
        if (err)
          return cb(err);
        fs.write(info.fd, msg);
        fs.close(info.fd, function(err) {
          if (err)
            return cb(err);
          if (state.isDryRunMode()) {
            console.log('*** DRY RUN: Will be exec: git commit -a -F '
                + info.path);
            superCb(null);
          } else {
            exec("git commit -a -F " + info.path, function(err) {
              if (err) {
                return superCb(err);
              } else {
                return superCb(null);
              }
            });
          }
        });
      });
    });

    async.waterfall(tasks, function(err) {
      if (err)
        return superCb(err);
    });
  };
};

var createTasks = function(files) {
  var tasks = new Array();
  _.each(files, function(file) {
    tasks.push(function(buf, cb) {
      exec('git diff --no-color HEAD ' + file, function(err, stdout) {
        if (err)
          return cb(err);
        buf += stdout;
      });
    });
  });
  return tasks;
};