var fs = require('fs');
var async = require('async');

exports.getExecutor = function(state) {
  return function(cb) {
    var packageJsonPath = state.getPackageJsonPath();
    var ver = state.getVersion();
    if(state.isDryRunMode()) {
      console.log("*** DRY RUN: not change version to " + ver);
      cb(null);
    } else {
      var superCb = cb;
      var tasks = [
      function(cb) {
        //Update version in package.json
        fs.readFile(packageJsonPath, 'utf8', function(err, pkg) {
          pkg = pkg.replace(/("version"\s*:\s*")[^"]+"/, '$1' + ver + '"');
          fs.writeFile(packageJsonPath, pkg, 'utf8', function(err) {
            cb(err);
          });
        });
      }];

      var mainFilePath = state.getMainFilePath();
      console.log(mainFilePath);
      if(mainFilePath) {
        tasks.push(function(cb) {
          //Update version in main file
          fs.readFile(mainFilePath, 'utf8', function(err, code) {
            if(err)
              return cb(err);
            code = code.replace(/(exports\.version\s*=\s*[\'\"])(?:.+)([\"\'])/, '$1' + ver + '$2');
            fs.writeFile(mainFilePath, code, 'utf8', function(err) {
              cb(err);
            });
          });
        });
      }
      tasks.push(function() {
        superCb(null);
      });
      async.waterfall(tasks);
    }
  };
};
