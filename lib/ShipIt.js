/*!
* ShipIt.js
* Copyright(c) 2011 Hideaki Ohno <hide.o.j55{at}gmail.com>
* MIT Licensed
*/

/**
 * Library version.
 */

exports.version = '0.2.5';

var fs = require('fs');
var path = require('path');
var exists = fs.exists ? fs.exists.bind(fs) : path.exists.bind(path);

// Default 'steps'
var defaultSteps = function() {
  return ["FindVersion", "ChangeVersion", "CheckChangeLog", "Commit", "Tag", "Publish"];
};

// Writing configuration file
var writeConfig = function(basePath) {
  var configPath = path.join(basePath, '.shipit.json');
  var config = {
    steps : defaultSteps(),
    CheckChangeLog : {
      files : ["History.md"]
    }
  };
  exists(configPath, function(is_exists) {
    if (is_exists) {
      console.warn('Config file already exists: ' + configPath);
    } else {
      var bt = require('js-beautify-node/beautify').js_beautify;
      fs.writeFile(configPath, bt(JSON.stringify(config)), function(err) {
        if (err) {
          throw err;
        }
        console.info('Successfully created config file: ' + configPath);
      });
    }
  });
};

// State object
var State = function(cwd, release, options) {
  var readline = require('readline');
  var semver = require('semver');

  if (!options) {
    options = {};
  }
  var _options = options;
  this._basePath = cwd;
  if (options.dryRun) {
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

  if (!release)
    release = 'custom';

  if (!parsedIndexLookup[release]) {
    throw new Error('Invalid release type: ' + release);
  }

  var version, curVersion, changeLogs = [], vc, mainFilePath, config;

  var rli;
  if (semver.gte(process.version, '0.8.0')) {
    rli = readline.createInterface({
      input : process.stdin,
      output : process.stdout
    });
  } else {
    rli = readline.createInterface(process.stdin, process.stdout);
  }

  this.isDryRunMode = function() {
    return _options.dryRun;
  };
  this.getBasePath = function() {
    return cwd;
  };
  this.getPackageJsonPath = function() {
    return path.join(cwd, (config || {}).usePackageLS ? 'package.ls' : 'package.json');
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
    if (semver.valid(_ver)) {
      version = _ver;
    } else {
      throw new Error('Invalid version number: ' + _ver);
    }
  };
  this.getCurrentVersion = function() {
    return curVersion;
  };
  this.setCurrentVersion = function(_ver) {
    if (semver.valid(_ver)) {
      curVersion = _ver;
    } else {
      throw new Error('Invalid version number: ' + _ver);
    }
  };
  this.getVc = function() {
    return vc;
  };
  this.setVc = function(_vc) {
    vc = _vc;
  };
  this.setConfig = function(_config) {
    config = _config;
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

// Release package to NPM
var releasePackage = function(cwd, release, options) {
  var _ = require('underscore')._;
  var async = require('async');

  var state;
  try {
    state = new State(cwd, release, options);
  } catch (e) {
    console.log('Error: ' + e.message);
    return;
  }
  var packageJsonPath = state.getPackageJsonPath();
  var configPath = state.getConfigPath();
  var rollbacks = [];
  async.waterfall([
  function(cb) {
    fs.readFile(packageJsonPath, function(err, data) {
      var pkg;
      if (err)
        return cb(err);
      try {
        pkg = JSON.parse(data);
        if (!pkg || !pkg.version) {
          throw new Error("Bad package.json");
        }
      } catch (e) {
        return cb(e);
      }
      // get version from package.json
      state.setVersion(pkg.version);
      state.setCurrentVersion(pkg.version);

      var mainFile = pkg.main;
      var mainFilePath;
      if (mainFile) {
        mainFilePath = path.normalize(path.join(cwd, mainFile));
        exists(mainFilePath, function(is_exists) {
          if (is_exists) {
            if (mainFilePath.match(/\.js$/)) {
              // Main file must be .js file
              state.setMainFilePath(mainFilePath);
            }
          } else {
            // mainFilePath is directory
            var tmp = path.join(mainFilePath, 'index.js');
            exists(tmp, function(is_exists) {
              if (is_exists) {
                state.setMainFilePath(tmp);
              }
            });
          }
        });
      } else {
        mainFilePath = path.normalize(path.join(cwd, 'index.js'));
        exists(mainFilePath, function(is_exists) {
          if (is_exists) {
            state.setMainFilePath(mainFilePath);
          }
        });
      }
      // read configuration
      fs.readFile(configPath, function(err, data) {
        if (err)
          return cb(err);
        cb(null, JSON.parse(data));
      });
    });
  },

  function(config, cb) {
    require('./vc').vc(config.vc || {}, function(err, vc) {
      if (err)
        return cb(err);
      state.setConfig(config);
      state.setVc(vc);
      return cb(null, config);
    });
  },

  function(config, cb) {
    var steps = [];
    _.each(config.steps, function(elm) {
      // load step modules
      var rollback;
      var conf = config[elm];
      if(conf === undefined){
      	conf = {};
      }
      var stepMod = require('./steps/' + elm);
      var step = stepMod.getExecutor(state, conf);
      var getRollback = stepMod.getRollback;
      if (getRollback && typeof getRollback == 'function') {
        rollback = stepMod.getRollback(state, conf);
      }
      steps.push(function(next) {
        if (rollback)
          rollbacks.unshift(rollback);
        step(next);
      });
    });
    var superCb = cb;
    steps.push(function(cb) {
      console.info('Shipped it!');
      cb(null);
      return superCb(null);
    });
    steps.push(function(cb) {
      state.closeReadlineInterface();
      process.stdin.destroy();
      cb(null);
    });
    async.waterfall(steps, function(err) {
      if (err)
        return superCb(err);
    });
  }], function(err) {
    if (err) {
      var finalize = function(state) {
        state.closeReadlineInterface();
        process.stdin.destroy();
      };
      console.error('ERROR: ' + err.message);
      if (rollbacks.length === 0 || state.isDryRunMode())
        return finalize(state);
      // Execute rollback process
      var boolPrompt = require('./util').getBoolPrompt(state);
      boolPrompt('Roll back? ', 'y', function(ans) {
        if (ans) {
          console.info('Rolling back executed steps...');
          rollbacks.push(function() {
            finalize(state);
          });
          async.waterfall(rollbacks);
        } else {
          finalize(state);
        }
      });
    }
  });
};

//Parse and Run command
exports.parseAndRun = function() {
  var cmd = require('commander');

  cmd
    .version(exports.version)
    .option('-x, --exec', 'Actually run commands (defaults to dry-run)', false);

  //Init
  cmd
    .command('init')
    .description('Write default configuration to `./.shipit.json`.')
    .action(function() {
      writeConfig(process.cwd());
    });

  //Release
  cmd
    .command('release [release-type]')
    .description('Release the package to NPM, where `release-type` is [major|minor|patch|build|custom].')
    .action(function(releaseType) {
      var isExec;
      if (cmd.exec === undefined) {
        isExec = true;
      } else {
        isExec = false;
      }
      releasePackage(process.cwd(), releaseType, {
        dryRun : isExec
      });
    });

  //If no arguments then display help.
  if (process.argv.length < 3) {
    process.argv.push('--help');
  }

  cmd.parse(process.argv);
};
