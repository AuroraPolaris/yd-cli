const fs = require('fs');
const URL = require('url');
const PATH = require('path');
const log = require('../logger');
const PipeLine = require('./Pipeline');

const MIME = require('./MIME');
const jadeCompiler = require('./compilers/jade');
const globalify = require('./transform/globalify.js');
const vueify = require('./transform/vueify.js');
const cssify = require('./transform/cssify.js');
const umdify = require('./transform/umdify.js');
const babelify = require('./transform/babelify.js');
const fileReader = require('./transform/fileReader.js');

/*
const isExclude = (url, excludeList)=> {
  return excludeList.some( (reg)=>{
    return reg.test(url)
  })
}
*/

const parseUrl = (url)=>{
  let ref = {};
  let key;
  const urlParsed = URL.parse(url);
  const pathParsed = PATH.parse(urlParsed.pathname);
  for (key in urlParsed) {
    ref[key] = urlParsed[key]
  }
  for (key in pathParsed) {
    ref[key] = pathParsed[key]
  }
  // /a -> a
  ref.dir = ref.dir.substr(1);
  ref.path = ref.path.substr(1);
  return ref;
}

const resolvePath = (filePath) => {
  const find = ['', '.js', '.vue', '.css', '/index.js', '/index.vue'].some(function (ext) {
    const path = filePath + ext;
    if (fs.existsSync(path) && fs.statSync(path).isFile()) {
      filePath = path;
      return true;
    } else {
      return false;
    }
  })
  return find && filePath;
}

module.exports = (options)=> {
  const LOADER_ROOT = options.staticRoot; const URL_ROOT = options.urlRoot;
  // node_modules 文件应用缓存
  const isNodeModuleFile = /node_modules/;

  // 常规文件
  const staticPipeline = new PipeLine('staticFile');
  staticPipeline.add(fileReader());
  staticPipeline.add(vueify());
  staticPipeline.add(cssify());
  staticPipeline.add(babelify());

  // node_module
  const nodePipeline = new PipeLine('nodeFile');
  nodePipeline.add(fileReader());
  nodePipeline.add(globalify());
  nodePipeline.add(cssify());
  nodePipeline.add(umdify());

  const requireFn = async (url)=> {
    /*
    if (url === '/' && options.index) {
      // index page
      let indexFilePath = PATH.join(options.root, options.index)
      content = fs.readFileSync(indexFilePath, 'utf-8');
      let fn = jadeCompiler(content, indexFilePath, {
        filename: indexFilePath,
        pretty: true,
        html: true
      })
      code = fn({
        debug: options.debug
      })
      return Promise.resolve({code: code})
    }
    */
    const ext = PATH.parse(URL.parse(url).pathname).ext;
    const contentType =  MIME[ext] || MIME['.html'];
    let parsed = parseUrl(url);
    let nodePath = '';
    const staticFile = PATH.join(LOADER_ROOT, parsed.dir, parsed.name)
    // resolve时无视扩展名，靠resolver自行寻找
    const localPath = resolvePath(staticFile);
    // a/b/c.ext
    const urlPath = PATH.join(parsed.dir, parsed.base);
    try{
      // 是否为 node 模块
      nodePath = require.resolve(urlPath);
    } catch (err) {}
    try{
      // 是否为 node 模块
      const p = urlPath.match(/^(.*)\.[\w]*$/);
      nodePath = require.resolve(p[1]);
    } catch (err) {}

    let usePipeline = null;
    let targetPath = null;
    if (nodePath) {
      // node
      usePipeline = nodePipeline;
      targetPath = nodePath;
    } else if (localPath) {
      usePipeline = staticPipeline;
      targetPath = localPath;
    } else {
      return Promise.resolve({code: null});
    }
    return usePipeline.write(new PipeLine.File({
      url: url,
      path: targetPath,
      name: parsed.name
    })).then(function (file) {
      if (file instanceof Error) {
        return {error: file};
      }
      file.done = true;
      return {
        code: file.content,
        contentType: contentType
      };
    })
  }
  const URL_ROOT_REG = new RegExp('^' + options.urlRoot);
  const loader = async function (ctx, next) {
    let url = ctx.request.url;
    if (url === '/') {
      // 未命中路由
      return await next();
    }
    const { code, error } = await requireFn(url);
    if (error) {
      await ctx.render('Error', {
        method: ctx.method,
        url: ctx.url,
        errorText: error.toString(),
        stack: error.stack
      });
    } else if (code) {
      const ext = PATH.parse(URL.parse(url).pathname).ext;
      const contentType =  MIME[ext] || MIME['.html'];
      ctx.set('Content-Type', contentType);
      ctx.body = code;
    } else {
      await next()
    }
  }
  loader.require = requireFn
  return loader
}
module.exports.MIME = MIME

