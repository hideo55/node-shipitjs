var fs = require('fs');
var async = require('async');

exports.getExecutor = function(state, config) {
  return function(cb) {
    var packageJsonPath = state.getPackageJsonPath();
    var ver = state.getVersion();
    if (state.isDryRunMode()) {
      console.log("*** DRY RUN: not change version to " + ver);
      cb(null);
    } else {
      var superCb = cb;
      var tasks = [
      function(cb) {
        //Update version in package.json
        fs.readFile(packageJsonPath, 'utf8', function(err, pkg) {
          if (config.file === 'package.ls') {
            pkg = pkg.replace(/^(version:\s*['"])\S+?([\'\"])?$/m, '$1' + ver + '$2');
          }
          else {
            pkg = pkg.replace(/("version"\s*:\s*")[^"]+"/, '$1' + ver + '"');
          }
          fs.writeFile(packageJsonPath, pkg, 'utf8', function(err) {
            if (err) {
              return cb(err);
            }
            if (config.file === 'package.ls') {
              var exec = require('child_process').exec;
              exec("npm run prepublish", function(err) {
                if (err)
                  return cb(err);
                cb(null);
              });
            }
            else {
              cb(null);
            }
          });
        });
      }];

      var mainFilePath = state.getMainFilePath();
      if (mainFilePath) {
        tasks.push(function(cb) {
          //Update version in main file
          fs.readFile(mainFilePath, 'utf8', function(err, code) {
            if (err)
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
exports.getRollback = function(state) {
  return function(cb) {
    var oldVer = state.getCurrentVersion();
    if (!oldVer)
      return cb(null);
    var packageJsonPath = state.getPackageJsonPath();
    var superCb = cb;
    var tasks = [
    function(cb) {
      //Update version in package.json
      fs.readFile(packageJsonPath, 'utf8', function(err, pkg) {
        pkg = pkg.replace(/("version"\s*:\s*")[^"]+"/, '$1' + oldVer + '"');
        fs.writeFile(packageJsonPath, pkg, 'utf8', function(err) {
          cb(err);
        });
      });
    }];

    var mainFilePath = state.getMainFilePath();
    if (mainFilePath) {
      tasks.push(function(cb) {
        //Update version in main file
        fs.readFile(mainFilePath, 'utf8', function(err, code) {
          if (err)
            return cb(err);
          code = code.replace(/(exports\.version\s*=\s*[\'\"])(?:.+)([\"\'])/, '$1' + oldVer + '$2');
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
  };
};
