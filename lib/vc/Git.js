var exec = require('child_process').exec;
var fs = require('fs');
var temp = require('temp');
var _ = require('underscore')._;

var Git = exports.Git = function(conf) {
  this.tagPattern = function() {
    return conf.tagPattern;
  };
  this.signTag = function() {
    return conf.signTag;
  };
  this.pushTo = function() {
    return conf.pushTo;
  };
};
Git.prototype = {
  commit : function(msg, cb) {
    var that = this;
    temp.open('tmpcomment', function(err, info) {
      if(err)
        return cb(err);
      fs.write(info.fd, msg);
      fs.close(info.fd, function(err) {
        if(err)
          return cb(err);
        exec("git commit -a -F " + info.path, function(err) {
          if(err)
            return cb(err);
          if(that.pushTo()) {
            that.getBranch(function(err, branch) {
              if(err)
                return cb(err);
              var cmd = 'git push ' + branch + ' ' + that.pushTo();
              exec(cmd, function(err) {
                return cb(err);
              });
            });
          } else {
            return cb(null);
          }
        });
      });
    });
  },
  tagVersion : function(ver, msg, cb) {
    var that = this;
    if(!msg)
      msg = "Tagging version " + ver + ".\n";
    temp.open('tmptag', function(err, info) {
      if(err)
        return cb(err);
      fs.write(info.fd, msg);
      fs.close(info.fd);
      var tag = that.tagPattern() || '';
      if(!tag.match(/\%v/i)) {
        tag += '%v';
      }
      tag = tag.replace(/\%v/, ver);
      var cmd = 'git tag -a';
      if(that.signTag()) {
        cmd += ' -s ';
      }
      cmd += ' -F' + info.path + ' ' + tag;
      exec(cmd, function(err) {
        cb(err);
      });
    });
  },
  localDiff : function(file, cb) {
    exec('git diff --no-color HEAD ' + file, function(err, stdout) {
      if(err)
        return cb(err);
      return cb(null, stdout);
    });
  },
  getBranch : function(cb) {
    fs.readFile('.git/HEAD', 'utf8', function(err, data) {
      if(err)
        return cb(err);
      var head = data.match(/ref: refs\/heads\/(\S)/);
      cb(null, head);
    });
  },
  existsTaggedVersion : function(ver, cb) {
    exec('git tag -l ' + ver, function(err, stdout) {
      if(err)
        return cb(err);
      var tag = stdout.replace(/\s+$/, '');
      if(tag.length == 0) {
        tag = false;
      } else {
        tag = true;
      }
      cb(null, tag);
    });
  },
  areLocalDiffs : function(ver, cb) {
    exec('git diff --no-color ' + ver, function(err, stdout) {
      if(err)
        return cb(err);
      var res = stdout.match(/¥S/) ? true : false;
      cb(null, res);
    });
  }
};
