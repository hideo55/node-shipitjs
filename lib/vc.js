var path = require('path');
var async = require('async');

var vc = exports.vc = function(conf, cb) {
  var superCb = cb;
  async.waterfall([
  function(cb) {
    path.exists('.git', function(exists) {
      if(exists) {
        var Git = require('./vc/Git').Git;
        var gitConf = conf.Git || {};
        return superCb(null, new Git(gitConf));
      } else {
        return cb(null);
      }
    });
  },
  function(cb) {
    path.exists('.hg', function(exists) {
      if(exists) {
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
