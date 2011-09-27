var exec = require('child_process').exec;
var fs = require('fs');
var path = require('path');

exports.getExecutor = function(state){
  var packageJsonPath = path.join(state.getBasePath(),'package.json');
  return function(callback){
    if(state.isVerifyMode()){
      console.log('Verify: git tag');
      callback(null);
    }else{
      fs.readFile(packageJsonPath, function(err,data){
        if(err){
          callback(err,null);
        }else{
          var json = JSON.parse(data);
          var version = json.version;
          if(!version){ version = '0.0.1'; }
          exec("git tag " + version, function(err, stdout){
            if(err){
              callback(err);
            }else{
              callback(null);
            }
          });
        }
      });
    }
  };
};