const path = require('path');
const fs = require('fs');
const cssCompiler = require('../compilers/css');

module.exports = function () {
  return function(file, next, done) {
    if (!file.content || path.parse(file.path).ext !== '.css') {
      // skip
      return next(file);
    }
    cssCompiler(file.content.toString()).then(function (cssCode) {
      // merge code
      const paths = file.url.split('/');
      paths.pop();

      const dir = paths.join('/');
      // 将css文件中的相对路径替换为与url近似的绝对路径
      cssCode = cssCode.replace(/url\(['"]?([^\)'"]*)['"]?\)/g, function (match, $1, $2) {
        return 'url(' + path.join(dir, $1) + ')';
      });

      let code = "//" + file + "\ninsert(" + JSON.stringify(cssCode) + ");\n";
      file.content = 'define(["insert-css"], function(insert){\n' + code + '\n});'
      done(file);
    })
  }
}
