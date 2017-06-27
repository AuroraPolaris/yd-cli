var sleep = function (duration) {
  return new Promise(function (resolve) {
    setTimeout(resolve, duration);
  });
}

module.exports = {
  index: async function (ctx, next) {
    await sleep(2000)
    ctx.body = {
      status: 'success',
      result: 'World'
    }
  },
  show: function (ctx, next) {
    ctx.body = 'show'
  },
  create: function (ctx, next) {
    ctx.body = 'create'
  }
}
