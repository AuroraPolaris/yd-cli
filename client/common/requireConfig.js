(function (config) {
  if (typeof window === 'object') {
    window.require = config();
  } else if (typeof module === 'object') {
    module.exports = config();
  }
})(function () {
  return {
    baseUrl: '/',
    paths: {
      'vue': 'vue/dist/vue',
      'axios': 'axios/dist/axios.min',
      'element-ui': 'element-ui/lib'
    }
  }
});
