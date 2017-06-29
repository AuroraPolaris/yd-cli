const path = require('path');
const insertGlobals = require('insert-module-globals');


module.exports = function () {
  return function(file, next, done) {
    if (!file.content || path.parse(file.path).ext !== '.js') {
      return next(file)
    }

    var inserter = insertGlobals(file.path, {
      vars: {
        process: function (file) {
          const _process = {
            env: {
              NODE_ENV: process.env.NODE_ENV
            }
          }
          return JSON.stringify(_process);
        }
      }
    })
    inserter.on('data', function (data) {
      file.content = data.toString()
      next(file);
    })
    inserter.write(file.content.toString());
    inserter.end();
  }
}
