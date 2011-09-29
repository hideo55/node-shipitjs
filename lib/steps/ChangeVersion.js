var fs = require('fs');
var path = require('path');

exports.getExecutor = function(state, options) {
  return function(cb) {
    var packageJsonPath = state.getPackageJsonPath();
    fs.readFile(packageJsonPath, 'utf8', function(err, pkg) {
      var ver = state.getVersion();
      pkg = pkg.replace(/("version"\s*:\s*")[^"]+"/, '$1' + ver + '"');
      fs.writeFile(packageJsonPath, pkg, 'utf8', function(err) {
        cb(err);
      });
    });
  };
};
