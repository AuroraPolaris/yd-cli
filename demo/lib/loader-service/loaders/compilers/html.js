
module.exports = function (code, filePath, options) {
  return "function template () {\n return " + JSON.stringify(code.replace(/\r|\n/g, '')) + "\n}";
}
