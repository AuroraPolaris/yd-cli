var fs = require('fs');
var path = require('path');

var cwd = process.cwd();
var debug = process.env && process.env.NODE_ENV === 'development';

module.exports = {
  debug: debug,
  // 命中 loader 的url路径
  urlRoot: '/client',
  // loader 扫描的文件目录
  staticRoot: path.join(cwd, 'client'),
  viewsRoot: path.join(cwd, 'lib/service/template'),
  // loader 通信端口
  axonPort: 9999,
  // 对外服务端口
  httpPort: 3000
}

