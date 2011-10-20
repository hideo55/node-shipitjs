var fs = require('fs');

exports.getExecutor = function(state) {
  return function(cb) {
    var packageJsonPath = state.getPackageJsonPath();
    var ver = state.getVersion();
    if(state.isDryRunMode()) {
      console.log("*** DRY RUN: not change version to " + ver);
      cb(null);
    } else {
      fs.readFile(packageJsonPath, 'utf8', function(err, pkg) {
        pkg = pkg.replace(/("version"\s*:\s*")[^"]+"/, '$1' + ver + '"');
        fs.writeFile(packageJsonPath, pkg, 'utf8', function(err) {
          cb(err);
        });
      });
    }
  };
};
