const axon = require('axon');


module.exports = function (options) {
  const clientFileSocket = axon.socket('req');
  clientFileSocket.bind(options.port);

  const requireFn = function (params) {
    return new Promise(function (resolve) {
      clientFileSocket.send(params, resolve);
    })
  }
  return async function (ctx, next) {
    let url = ctx.request.url;
    if (url === '/') {
      // 未命中路由
      return await next();
    }
    const { code, error, contentType } = await requireFn(url);
    if (error) {
      await ctx.render('Error', {
        method: ctx.method,
        url: ctx.url,
        errorText: error.toString(),
        stack: error.stack
      });
    } else if (code) {
      ctx.set('Content-Type', contentType);
      ctx.body = code;
    } else {
      await next()
    }
  }
}
