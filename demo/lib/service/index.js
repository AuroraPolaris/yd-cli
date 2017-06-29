require('babel-register')({
  presets: ["stage-3"],
  plugins: ['transform-async-to-generator']
});
require('./app.js');


