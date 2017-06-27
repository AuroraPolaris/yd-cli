

module.exports = function (content, lang) {
  return new Promise(function (resolve, reject) {
    switch (lang) {
      case 'stylus':
        const stylus = require('stylus');
        const render = stylus(content);
        content = render.render().replace(/\n/g, '');
        resolve(content);
        break;
      case 'less':
        const less = require('less');
        less.render(content, {
          filename: 'style.less', // Specify a filename, for better error messages
          compress: true          // Minify CSS output
        },
        function (e, output) {
          resolve(e || output.css)
        });
        break;
      default:
        content = content.replace(/\n/g, '')
        resolve(content)
    }
  })
}
