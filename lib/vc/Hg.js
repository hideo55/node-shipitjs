var exec = require('child_process').exec;
var fs = require('fs');
var temp = require('temp');
var _ = require('underscore')._;

var Hg = exports.Hg = function(conf) {
  this.pushTo = function() {
    return conf.PushTo;
  };
};
Hg.prototype = {
  commit : function(msg, cb) {
    var that = this;
    exec('hg status -u', function(err, stdout) {
      if(err) return cb(err);
      if(stdout.length > 0 ){
        return cb(new Error("Unknown local files:\n" + stdout + "\nUpdate .hgignore, or hg add them"));
      }
      exec('hg commit -m "' + msg + '"', function(err) {
        if(err)
          return cb(err);
        return cb(null);
      });
    });
  },
  resetRecentCommit : function(cb) {
    if(!this.pushTo()) {
      exec('hg rollback', function(err) {
        cb(err);
      });
    } else {
      console.warn('[WARN] Can not reset already pushed commit');
      cb(null);
    }
  },
  tagVersion : function(ver, msg, cb) {
    var that = this;
    if(!msg)
      msg = "Tagging version " + ver + ".\n";
    var cmd = 'hg tag -m "' + msg + '" ' + ver;
    exec(cmd, function(err) {
      if(err)
        return cb(err);
      if(that.pushTo()) {
        var cmd = "hg push " + that.pushTo();
        exec(cmd, function(err) {
          cb(err);
        });
      }else{
        cb(null);
      }
    });
  },
  deleteTag : function(ver, cb) {
    if(!this.pushTo()) {
      var cmd = 'hg tag --remove ' + ver;
      exec(cmd, function(err) {
        cb(err);
      });
    } else {
      console.warn('[WARN] Can not reset already pushed commit');
      cb(null);
    }
  },
  localDiff : function(file, cb) {
    exec('hg diff ' + file, function(err, stdout) {
      if(err)
        return cb(err);
      return cb(null, stdout);
    });
  },
  existsTaggedVersion : function(ver, cb) {
    exec('hg tags', function(err, stdout) {
      if(err)
        return cb(err);
      var pattern = new RegExp('^' + ver + '\s', 'm');
      var isExists = stdout.match(pattern);
      cb(null, isExists);
    });
  },
  areLocalDiffs : function(ver, cb) {
    exec('hg status', function(err, stdout) {
      if(err)
        return cb(err);
      var res = stdout.match(/\S/) ? true : false;
      cb(null, res);
    });
  }
};
