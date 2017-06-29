
module.exports = function (code, filePath, options = {}) {
  const jade = require('jade');
  try{
    if (options.html){
      return jade.compile(code, options)
    } else {
      return jade.compileClient(code, options)
    }
  } catch (e) {
    return e.toString()
  }
}
