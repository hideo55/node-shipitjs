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

var State = function(cwd, options) {
  var _options = {};
  this._basePath = cwd;
  if (options['verify']) {
    _options.verify = true;
  } else {
    _options.verify = false;
  }
  if (options['skip_test']) {
    _options.skipTest = true;
  } else {
    _options.skipTest = false;
  }
  this._options = _options;
};

State.prototype = {
  isVerifyMode : function() {
    return this._options.verify;
  },
  isTestSkipMode : function() {
    return this._options.skipTest;
  },
  getBasePath : function() {
    return this._basePath;
  }
};

var shipItExec = exports.shipItExec = function(cwd, options) {
  var state = new State(cwd, options);
  var basePath = state.getBasePath();
  var configPath = path.join(basePath, '.shipit.json');
  var packageJsonPath = path.join(basePath, 'package.json');
  async.waterfall([ function(callback) {
    // read configuration
    fs.readFile(configPath, callback);
  }, function(data, callback) {
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
    callback(null, steps);
  }, function(steps, callback) {
    var superCallback = callback;
    steps.push(function(callback) {
      console.log('Success to ship it');
      superCallback(null);
    });
    async.waterfall(steps, function(err) {
      if (err) {
        superCallback(err);
      }
    });
  } ], function(err) {
    if (err) {
      console.log('ERROR: ' + err.message);
    }
  });
};