var exec = require('child_process').exec;
var spawn = require('child_process').spawn;
var fs = require('fs');
var path = require('path');
var async = require('async');
var _ = require('underscore')._;

exports.getExecutor = function(state, conf) {

  var checkChangeLog = function(file, ver, cb) {
    fs.readFile(file, 'utf8', function(err, data) {
      if(err)
        return cb(err, false);
      var pattern = new RegExp('^' + ver);
      if(data.match(pattern))
        return cb(null, true);
      console.warn("No mention of version " + ver + " in changelog file " + file);
      return cb(null, false);
    });
  };
  var toBool = function(yn) {
    if(yn.match(/^y/i))
      return true;
    if(yn.match(/^n/i))
      return false;
    return null;
  };
  var boolPrompt = function(msg, cb) {
    var i = state.getReadlineInterface();
    i.question('Edit file? [Y/n]', function(ans) {
      var yn = toBool(ans);
      if(yn) {
        return cb(true);
      } else if(yn == false) {
        return cb(false);
      } else {
        console.warn("Please answer 'y' or 'n'");
        boolPrompt(msg, cb);
      }
    });
  };
  var editFile = function(file) {
    var editor = process.env.EDITOR || 'vim';
    spawn(editor, [file], {
      customFds : [process.stdin, process.stdout, process.stderr]
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
            boolPrompt('Edit file?', function(ans) {
              if(!ans) {
                return superCb(new Error("Aborting."));
              }
              editFile(file);
              checkChangeLog(file, ver, function(err, isExists) {
                if(err)
                  return cb(err);
                if(!isExists)
                  return superCb(new Error("Aborting."));
                cb(null);
              });
            });
          } else {
            cb(null);
          }
        });
      });
    });
    tasks.push(function(cb) {
      cb(null);
      superCb(null);
    });
    async.waterfall(tasks);
  };
};
