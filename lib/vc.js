var path = require('path');

var vc = exports.vc = function(conf){
  if( path.existsSync('.git') ){
    var Git = require('./vc/Git').Git;
    var gitConf = conf.Git || {};
    return new Git(gitConf);
  }
};