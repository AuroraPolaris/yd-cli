const http = require('http');
const URL = require('url');
const path = require('path');
const Koa = require('koa');
const KoaViews = require('koa-views');
const KoaStatic = require('koa-static2');
const koaBodyParser = require('koa-better-body');
const KoaRouter = require('koa-rest-router');
const logger = require('./logger');

const config = require(path.join(process.cwd(), 'conf.js'))

const app = new Koa();
const PORT = config.httpPort;

const httpServer = http.createServer(app.callback());


app.use(async (ctx, next)=>{
  if (ctx.url === '/favicon.ico') {
    ctx.body = ''
  } else {
    await next()
  }
})

// 模板引擎配置
app.use(KoaViews(config.viewsRoot, {
  extension: 'pug'
}));

// for error status
app.use(async (ctx, next)=> {
  await next();
  const status = ctx.response.status;
  if (status === 404) {
    ctx.body = 404;
    await ctx.render('404', {
      user: 'John'
    });
  }
})
// 扩展
app.use(async (ctx, next)=>{
  ctx.json = function (result) {
    this.body = JSON.stringify(result);
  }
  await next()
})
// 简易日志
app.use(logger.koa({
  ignore: /\.(js|woff)$/
}));

// 静态文件
app.use(KoaStatic('static', config.staticRoot));

// body-parser
app.use(koaBodyParser({
  formLimit: "5000000",
  textLimit: "5000000",
  jsonLimit: "5000000",
  maxFieldsSize: "5000000"
}));

// restful api
// api doc: https://github.com/tunnckoCore/koa-rest-router
const api = KoaRouter({
  prefix: '/api'
})
api.resource('user', require('./api/user'))
app.use( api.middleware())

// file loader
app.use(require('./devService')({
	port: config.axonPort
}))

// 首页
app.use(async (ctx, next)=> {
	if (!ctx.body) {
		await ctx.render('index', {
			appname: 'John'
		});
	}
})

httpServer.listen(PORT, () => {
  console.log('listen on ' + PORT)
	return
  api.routes.forEach((route) => {
    console.log(`${route.method} http://localhost:${PORT}${route.path}`)
  })
});
