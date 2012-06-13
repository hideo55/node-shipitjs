var path = require('path');
var fs = require('fs');
var async = require('async');
var exists = fs.exists ? fs.exists.bind(fs) : path.exists.bind(path);

var vc = exports.vc = function(conf, cb) {
  var superCb = cb;
  async.waterfall([
  function(cb) {
    exists('.git', function(is_exists) {
      if(is_exists) {
        var Git = require('./vc/Git').Git;
        var gitConf = conf.Git || {};
        return superCb(null, new Git(gitConf));
      } else {
        return cb(null);
      }
    });
  },
  function(cb) {
    exists('.hg', function(is_exists) {
      if(is_exists) {
        var Hg = require('./vc/Hg').Hg;
        var hgConf = conf.Hg || {};
        return superCb(null, new Hg(hgConf));
      } else {
        cb(new Error('Supported VCS not found'));
      }
    });
  }],function(err){
    superCb(err);
  });

};
