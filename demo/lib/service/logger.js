const log4js = require('log4js')


const logger = log4js.getLogger();

logger.koa = (options = {})=> {
  const IGNORE = options.ignore;
  return async (ctx, next)=> {
    if (IGNORE.test(ctx.url)) {
      return await next();
    }
    const start = new Date();
    await next();
    const ms = new Date() - start;
    ctx.set('X-Response-Time', `${ms}ms`);
    logger.info(`${ctx.method} ${ctx.url} - ${ms}ms`);
  }
}


module.exports = logger
