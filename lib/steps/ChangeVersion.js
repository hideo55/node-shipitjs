var fs = require('fs');

exports.getExecutor = function(state) {
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
