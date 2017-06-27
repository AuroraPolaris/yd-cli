//const Stream = require('stream');
const through = require('through');
const path = require('path');
const fs = require('fs');

const vueCompiler = require('vue-template-compiler')

const coffeeCompiler = require('../compilers/coffee');
const jadeCompiler = require('../compilers/jade');
const cssCompiler = require('../compilers/css');
const htmlCompiler = require('../compilers/html');
const babelCompiler = require('../compilers/babel');
const log = require('../../logger');


const compileTemplate = function (part) {
  switch (part.lang){
    case 'jade':
      part.resolved = jadeCompiler(part.content).toString();
      break;
    default:
      part.resolved = htmlCompiler(part.content);
  }
  return part;
}

const compileScript = function (part) {
  let code;
  switch (part.lang){
    case 'coffee':
      code = coffeeCompiler(part.content);
      part.resolved = code + '\n' + ';module.exports.template = template();'
      break;
    default:
      code = babelCompiler(part.content, null, {
        comments: false,
        presets: [
          "es2015",
        ],
        plugins: [
          ["transform-object-rest-spread", { "useBuiltIns": true }]
        ],
        ast: false
      });
      part.resolved = code + ';\nexports.default.template = template();'
  }
  return part;
}

const compileCss = function (styles) {
  return Promise.all(styles.map(function (s) {
    return cssCompiler(s.content, s.lang)
  })).then(function (css) {
    return {
      resolved: css.join('')
    }
  })
}
const wrapComment = function (type, code) {
  return `//----> ${type} start\n${code}\n//<----${type} end`;
}

const compileVue = (content, filename)=> {
  var parts = vueCompiler.parseComponent(content, {
    pad: true
  })
  return Promise.all([
    compileScript(parts.script),
    compileTemplate(parts.template),
    compileCss(parts.styles)
  ]).then(function (result) {
    // merge code
    const codeArray = [];
    if (result[2] && result[2].resolved) {
      let cssCode = "//" + filename + "\nrequire('insert-css')(" + JSON.stringify(result[2].resolved) + ");\n";
      cssCode = wrapComment('css', cssCode);
      codeArray.push(cssCode)
    }
    if (result[1] && result[1].resolved) {
      // template
      const templateCode = wrapComment('template', result[1].resolved);
      codeArray.push(templateCode)
    }
    // script
    const scriptCode = wrapComment('script', result[0].resolved);
    codeArray.push(scriptCode);

    const code = 'define(function(require, exports, module){\n' + codeArray.join('//\n//\n//\n') + '\n});'
    return {
      contentType: 'application/javascript',
      code: code
    };
  })
}


module.exports = function () {
  return function (file, next, done) {
    if (!file.content || path.parse(file.path).ext !== '.vue') {
      // skip
      return next(file);
    }
    //content = fs.readFileSync(file, 'utf-8');
    compileVue(file.content.toString(), file.name).then(function (result) {
      file.content = result.code;
      done(file);
    }).catch(function (err) {
      done(err);
    });
  }
}
