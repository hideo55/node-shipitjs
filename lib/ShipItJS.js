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

var shipIt = function(path) {
  var packageJsonPath = path + '/package.json';
  async.waterfall([ function(callback) {
    //read package.json
    fs.readFile(packageJsonPath, callback);
  }, function(data, callback) {
    var json = JSON.parse(data);
    var version = json.version;
    if(!version){ version = '0.0.1'; }
    exec("git tag " + version, callback);
  },function(stdout,stderr, callback){
    if( stdout ){ console.log(stdout); }
    exec("npm publish",callback);
  },function(stdout,stderr){
    if( stdout ){ console.log(stdout); }
    console.log('npm publish finished successful!');
    callback(null);
  }
  ],function(err){
    console.log('ERROR:' + err.message);
  });
};

exports.shipIt = shipIt;