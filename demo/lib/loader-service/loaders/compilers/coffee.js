const coffeescript = require('coffee-script');

module.exports = function (code, filePath, options) {
  return coffeescript.compile(code || '', {
    sandbox: false,
    header: false,
    bare: true
  });
}
