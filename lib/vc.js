var path = require('path');

var vc = exports.vc = function(conf, cb) {
  path.exists('.git', function(exists) {
    if (exists) {
      var Git = require('./vc/Git').Git;
      var gitConf = conf.Git || {};
      return cb(null, new Git(gitConf));
    }else{
      cb(new Error('Supported VCS not found'));
    }
  });
};