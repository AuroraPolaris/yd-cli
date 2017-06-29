const path = require('path');

const umd = (function (factory) {
  if (typeof define === 'function') {
    define(factory)
  } else {
    factory();
  }
}).toString();

module.exports = function () {
  return function (file, next, done) {
    if (!file.content || path.parse(file.path).ext !== '.js') {
      return next(file)
    }
    file.content = '(' + umd + ')(function(require, exports, module){\n' + file.content.toString() + '\n});';
    next(file)
  }
}
