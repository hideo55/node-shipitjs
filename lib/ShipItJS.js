/*!
 * ShipIt.js
 * Copyright(c) 2011 Hideaki Ohno <hide.o.j55{at}gmail.com>
 * MIT Licensed
 */

/**
 * Library version.
 */

exports.version = '0.0.1';

var _ = require('underscore')._;
var fs = require('fs');
var path = require('path');
var exec = require('child_process').exec;
var async = require('async');
var semver = require('semver');

var defaultSteps = function() {
  return [ "ChangeVersion", "GitCommit", "GitTag", "GitPush" ];
};

// Writing configuration file
var writeConfig = exports.writeConfig = function(basePath) {
  var configPath = path.join(basePath, '.shipit.json');
  var config = {
    "steps" : [ "GitTag", "Publish" ]
  };
  path.exists(configPath, function(exists) {
    if (exists) {
      console.log('.shipit.json is already exists');
    } else {
      fs.writeFile(configPath, bt(JSON.stringify(config)), function(err) {
        if (err) {
          throw err;
        }
        console.log('Success to create configuration file : ' + configPath);
      });
    }
  });
};
var State;
State = function(cwd, release, options) {
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

  var version;

  var parsedIndexLookup = {
    'major' : 1,
    'minor' : 2,
    'patch' : 3,
    'build' : 4
  };

  if (!release) {
    throw new Error("release type is missing");
  } else if (!parsedIndexLookup[release]) {
    throw new Error("release type is invalid: " + release);
  }
  
  var changeLogs = new Array();

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
    if (semver.valid(_ver)) {
      version = _ver;
    } else {
      throw new Error("version number is invalid: " + _ver);
    }
  };
  this.getChangeLogFiles = function(){
    return changeLogs;
  };
  this.pushChangeLogFile = function(file){
    changeLogs.push(file);
  };
};

var shipItExec = exports.shipItExec = function(cwd, release, options) {
  var state;
  try{
    state= new State(cwd, release, options);
  }catch(e){
    console.log('Error: ' + e.message);
    return;
  }
  var packageJsonPath = state.getPackageJsonPath();
  var configPath = state.getConfigPath();

  async.waterfall([ function(cb) {
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

      // read configuration
      fs.readFile(configPath, cb);
    });
  }, function(data, cb) {
    var steps = new Array();
    _.each(JSON.parse(data).steps, function(elm) {
      // load step modules
      var step;
      if (elm.match('^.+=.+$')) {
        var param = elm.split('=');
        step = require('./steps/' + param[0]).getExecutor(state, param[1]);
      } else {
        step = require('./steps/' + elm).getExecutor(state);
      }
      steps.push(step);
    });

    var superCb = cb;
    steps.push(function(cb) {
      console.log('Success to ship it');
      superCb(null);
    });
    async.waterfall(steps, function(err) {
      if (err)
        superCb(err);
    });

  } ], function(err) {
    if (err) {
      console.log('ERROR: ' + err.message);
    }
  });
};