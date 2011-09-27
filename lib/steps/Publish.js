var exec = require('child_process').exec;

exports.getExecutor = function(state) {
  return function(callback) {
    if (state.isVerifyMode()) {
      console.log('Verify: npm publish');
      callback(null);
    } else {
      exec("npm p", function(err, stdout) {
        if (err) {
          callback(err);
        } else {
          callback(null);
        }
      });
    }
  };
};