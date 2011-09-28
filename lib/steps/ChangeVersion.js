var fs = require('fs');
var path = require('path');
var semver = require('semver');

exports.getExecutor = function(state, options) {
  return function(cb) {
    fs.readFile(state.getPackageJsonPath(), 'utf8', function(err, pkg) {
      var current = state.getVersion();
      var next = semver.inc(current, state.getReleaseType());

      if (!semver.valid(next))
        die("Invalid release type '" + release + "'");

      next = next.replace(/-0$/, '');

      state.setVersion(next);

      pkg = pkg.replace(/("version"\s*:\s*")[^"]+"/, '$1' + next + '"');

      fs.writeFile('package.json', pkg, 'utf8', function(err) {
        cb(err);
      });
    });
  };
};