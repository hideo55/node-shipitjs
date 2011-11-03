/*!
* ShipIt.js
* Copyright(c) 2011 Hideaki Ohno <hide.o.j55{at}gmail.com>
* MIT Licensed
*/

/**
 * Library version.
 */

exports.version = '0.1.0';

var fs = require('fs');
var path = require('path');
var exec = require('child_process').exec;
var readline = require('readline');
var async = require('async');
var semver = require('semver');
var _ = require('underscore')._;
var bt = require('js-beautify-node/beautify').js_beautify;

var defaultSteps = function() {
  return ["FindVersion", "ChangeVersion", "CheckChangeLog", "Commit", "Tag", "Publish"];
};
// Writing configuration file
var writeConfig = exports.writeConfig = function(basePath) {
  var configPath = path.join(basePath, '.shipit.json');
  var config = {
    steps : defaultSteps(),
    CheckChangeLog : {
      files : ["History.md"]
    }
  };
  path.exists(configPath, function(exists) {
    if(exists) {
      console.log('.shipit.json is already exists');
    } else {
      fs.writeFile(configPath, bt(JSON.stringify(config)), function(err) {
        if(err) {
          throw err;
        }
        console.log('Success to create configuration file : ' + configPath);
      });
    }
  });
};
var State;
State = function(cwd, release, options) {
  if(!options) {
    options = {};
  }
  var _options = options;
  this._basePath = cwd;
  if(options.dryRun) {
    _options.dryRun = true;
  } else {
    _options.dryRun = false;
  }

  var parsedIndexLookup = {
    'major' : 1,
    'minor' : 2,
    'patch' : 3,
    'build' : 4,
    'custom' : 5
  };

  if(!release)
    release = 'custom';

  if(!parsedIndexLookup[release]) {
    throw new Error("release type is invalid: " + release);
  }

  var version, changeLogs = new Array(), vc, mainFilePath;

  var rli = readline.createInterface(process.stdin, process.stdout);

  this.isDryRunMode = function() {
    return _options.dryRun;
  };
  this.getBasePath = function() {
    return cwd;
  };
  this.getPackageJsonPath = function() {
    return path.join(cwd, 'package.json');
  };
  this.getConfigPath = function() {
    return path.join(cwd, '.shipit.json');
  };
  this.getOption = function(name) {
    return _options[name];
  };
  this.getReleaseType = function() {
    return release;
  };
  this.getVersion = function() {
    return version;
  };
  this.setVersion = function(_ver) {
    if(semver.valid(_ver)) {
      version = _ver;
    } else {
      throw new Error("version number is invalid: " + _ver);
    }
  };
  this.getVc = function() {
    return vc;
  };
  this.setVc = function(_vc) {
    vc = _vc;
  };
  this.getChangeLogFiles = function() {
    return changeLogs;
  };
  this.addChangeLogFile = function(file) {
    changeLogs.push(file);
  };
  this.getReadlineInterface = function() {
    return rli;
  };
  this.closeReadlineInterface = function() {
    rli.close();
  };
  this.setMainFilePath = function(path) {
    mainFilePath = path;
  };
  this.getMainFilePath = function() {
    return mainFilePath;
  };
};
var shipItExec = exports.shipItExec = function(cwd, release, options) {
  var state;
  try {
    state = new State(cwd, release, options);
  } catch (e) {
    console.log('Error: ' + e.message);
    return;
  }
  var packageJsonPath = state.getPackageJsonPath();
  var configPath = state.getConfigPath();
  var rollbacks = new Array;
  async.waterfall([
  function(cb) {
    fs.readFile(packageJsonPath, function(err, data) {
      var pkg;
      if(err)
        return cb(err);
      try {
        pkg = JSON.parse(data);
        if(!pkg || !pkg.version) {
          throw new Error("Bad package.json");
        }
      } catch (e) {
        return cb(e);
      }
      // get version from package.json
      state.setVersion(pkg.version);

      var mainFile = pkg.main;
      if(mainFile) {
        var mainFilePath = path.normalize(path.join(cwd, mainFile));
        path.exists(mainFilePath, function(exists) {
          if(exists) {
            if(mainFilePath.match(/\.js$/)) {
              // Main file must be .js file
              state.setMainFilePath(mainFilePath);
            }
          } else {
            // mainFilePath is directory
            var tmp = path.join(mainFilePath, 'index.js');
            path.exists(tmp, function(exists) {
              if(exists) {
                state.setMainFilePath(tmp);
              }
            });
          }
        });
      } else {
        var mainFilePath = path.normalize(path.join(cwd, 'index.js'));
        path.exists(tmp, function(exists) {
          if(exists) {
            state.setMainFilePath(tmp);
          }
        });
      }
      // read configuration
      fs.readFile(configPath, function(err, data) {
        if(err)
          return cb(err);
        cb(null, JSON.parse(data));
      });
    });
  },

  function(config, cb) {
    require('./vc').vc(config.vc || {}, function(err, vc) {
      if(err)
        return cb(err);
      state.setVc(vc);
      return cb(null, config);
    });
  },

  function(config, cb) {
    var steps = new Array();
    _.each(config.steps, function(elm) {
      // load step modules
      var rollback;
      var conf = config[elm];
      var stepMod = require('./steps/' + elm);
      var step = stepMod.getExecutor(state, conf);
      if(stepMod["getRollback"] && typeof stepMod["getRollback"] == 'function') {
        rollback = stepMod.getRpllbak(state, conf);
      }
      steps.push(function(cb) {
        console.log('[' + elm + ']');
        if(rollback)
          rollbacks.unshift(rollback);
        step(cb);
      });
    });
    var superCb = cb;
    steps.push(function(cb) {
      console.log('Success to ship it');
      cb(null);
      return superCb(null);
    });
    steps.push(function(cb) {
      state.closeReadlineInterface();
      process.stdin.destroy();
      cb(null);
    });
    async.waterfall(steps, function(err) {
      if(err)
        return superCb(err);
    });
  }], function(err) {
    if(err) {
      console.error('ERROR: ' + err.message);
      if(rollbacks.length == 0 || state.isDryRun())
        return finalize(state);
      var boolPrompt = require('./util').getBoolPrompt(state);
      boolPrompt('Rollback?', 'y', function(ans) {
        if(ans) {
          async.waterfall(rollbacks);
        } else {
          finalize(state);
        }
      });
    }
  });
};
function finalize(state) {
  state.closeReadlineInterface();
  process.stdin.destroy();
}