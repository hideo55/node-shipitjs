/*!
 * ShipIt.js
 * Copyright(c) 2011 Hideaki Ohno <hide.o.j55{at}gmail.com>
 * MIT Licensed
 */

/**
 * Library version.
 */

exports.version = '0.0.1';

var fs = require('fs');
var exec = require('child_process').exec;
var async = require('async');
var bt = require('js-beautify-node/beautify').js_beautify;

var shipIt = function(path, version) {
  var packageJsonPath = path + '/package.json';
  async.waterfall([ function(callback) {
    //read package.json
    fs.readFile(packageJsonPath, callback);
  }, function(data, callback) {
    var json = JSON.parse(data);
    //update package.json
    json.version = version;
    fs.writeFile(packageJsonPath, bt(JSON.stringify(json)),callback);
  },function(callback){
    exec("git tag " + version, callback);
  },function(err,stdout,stderr, callback){
    console.log('ok');
  }
  ]);
};

exports.shipIt = shipIt;