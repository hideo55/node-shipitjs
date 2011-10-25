var exec = require('child_process').exec;
var spawn = require('child_process').spawn;
var fs = require('fs');
var path = require('path');
var async = require('async');
var _ = require('underscore')._;

exports.getExecutor = function(state, conf) {
  var boolPrompt = require('../util').getBoolPrompt(state);
  var checkChangeLog = function(file, ver, cb) {
    try {
      var data = fs.readFileSync(file, 'utf8');
      var pattern = new RegExp(ver);
      if(data.match(pattern))
        return cb(null, true);
      console.warn("No mention of version " + ver + " in changelog file " + file);
      return cb(null, false);
    } catch(e) {
      return cb(e);
    }
  };
  var editFile = function(file, cb) {
    var editor = process.env.EDITOR || 'vim';
    var child = spawn(editor, [file], {
      cwd : process.cwd(),
      customFds : [0, 1, 2]
    });
    process.stdin.pause();
    child.on('exit', function() {
      process.stdin.resume();
      cb();
    });
  };
  return function(cb) {
    conf = conf || {};
    var files = conf.files || [];
    var ver = state.getVersion();
    var tasks = new Array();
    var superCb = cb;
    _.each(files, function(file) {
      tasks.push(function(cb) {
        if(!path.existsSync(file)) {
          return superCb(new Error("Missing ChangeLog file: " + file));
        }
        state.addChangeLogFile(file);
        checkChangeLog(file, ver, function(err, isExists) {
          if(err)
            return superCb(err);
          if(!isExists) {
            boolPrompt('Edit file?', 'y', function(ans) {
              if(!ans) {
                return superCb(new Error("Aborting."));
              }
              editFile(file, function() {
                checkChangeLog(file, ver, function(err, isExists) {
                  if(err)
                    return superCb(err);
                  if(!isExists)
                    return superCb(new Error("Aborting."));
                  cb(null);
                });
              });
            });
          } else {
            cb(null);
          }
        });
      });
    });
    tasks.push(function() {
      superCb(null);
    });
    async.waterfall(tasks);
  };
};
