const PATH = require('path');
const babelCompiler = require('../compilers/babel');

module.exports = function () {
  return function (file, content, next, done) {
    if (!file.content || PATH.parse(file.path).ext !== '.js') {
      // skip
      return next(file);
    }
    // babelify
    let code = babelCompiler(file.content.toString(), file.path, {
      presets: [
        "es2015",
      ],
      plugins: [
        ["transform-object-rest-spread", { "useBuiltIns": true }],
        "transform-es2015-modules-amd"
      ],
      ast: false
    });
    file.content = code;
    next(file);
  }
}

