const babel = require("babel-core");

module.exports = function (code, filePath, options) {
  try {
    const parsed = babel.transform(code, options);
    return parsed.code;
  } catch (e) {
    return e.toString()
  }
}
