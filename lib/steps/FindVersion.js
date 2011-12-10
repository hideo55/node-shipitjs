var semver = require('semver');

exports.getExecutor = function(state) {
  return function(cb) {
    var ver = state.getVersion();
    var release = state.getReleaseType();
    var vc = state.getVc();
    vc
    .existsTaggedVersion(ver, function(err, isTagged) {
      if(err)
        return cb(err);
      console.log('Current version is: ' + ver);

      var def = '';
      var next;
      if(release != 'custom') {
        next = semver.inc(ver, release);
        def = '[' + next + ']';
      }

      if(!isTagged && release == 'custom') {
        def = '[' + ver + ']';
      }

      var i = state.getReadlineInterface();

      i.question('Next/relase version? ' + def, function(answer) {
        var newver;
        if(answer.length === 0) {
          newver = release == 'custom' ? ver : next;
        } else {
          newver = answer;
        }
        if(!semver.valid(newver)) {
          return cb(new Error('version number is invalid:' + newver));
        }

        if(isTagged && newver == ver) {
          vc
          .areLocalDiffs(ver, function(err, hasDiff) {
            if(err)
              return cb(err);
            if(hasDiff)
              return cb(new Error("No local changes, and version on disk is already tagged. Nothing to do."));
          });
        }

        vc
        .existsTaggedVersion(newver, function(err, isTagged) {
          if(err)
            return cb(err);
          if(isTagged)
            return cb(new Error("Sorry, version '" + newver + "' is already tagged. Stopping."));
          state.setVersion(newver);
          cb(null);
        });
      });
    });
  };
};
