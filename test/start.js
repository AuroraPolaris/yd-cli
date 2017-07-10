var request = require('request');
var expect = require('chai').expect;

var DOMAIN = 'http://127.0.0.1:3000'
describe('Static File', function() {
  describe('index', function() {
    it('index page should be render', function(done) {
      request(DOMAIN, function (err, response, body) {
        expect(body).to.include('<title>$PROJECT_NAME-dev</title>');
        done();
      })
    });
  });
  describe('/*.css.js', function() {
    it('global.css.js should be loaded', function(done) {
      request(DOMAIN + '/global.css.js', function (err, response, body) {
        expect(body).to.include('define(["insert-css"]');
        expect(body).to.include('h1.title');
        done();
      })
    });
  });
  describe('/common/*.js', function() {
    it('/requireConfig.js should be loaded', function(done) {
      request(DOMAIN + '/common/requireConfig.js', function (err, response, body) {
        expect(body).to.include('baseUrl');
        done();
      })
    });
  });
  describe('/src/*.js', function() {
    it('/util.js should be loaded', function(done) {
      request(DOMAIN + '/src/util.js', function (err, response, body) {
        expect(body).to.include('define');
        expect(body).to.include('new Date().toLocaleDateString();');
        done();
      })
    });
    it('/App.vue.js should be loaded', function(done) {
      request(DOMAIN + '/src/App.vue.js', function (err, response, body) {
        expect(body).to.include('define(function(require, exports, module){', 'not define');
        expect(body).to.include('template(locals)', 'not template');
        expect(body).to.include('function _interopRequireDefault(obj)', 'not es6 javascript');
        done();
      })
    });
  });
  describe('node_modules/*.js', function() {
    it('/element-ui.css.js should be loaded', function(done) {
      request(DOMAIN + '/element-ui/lib/theme-default/index.css.js', function (err, response, body) {
        expect(body).to.include('define(["insert-css"]');
        expect(body).to.include('el-breadcrumb:');
        done();
      })
    });
    it('/axios.min.js should be loaded', function(done) {
      request(DOMAIN + '/axios/dist/axios.min.js', function (err, response, body) {
        expect(body).to.include('define.amd');
        expect(body).to.include('this.interceptors=');
        done();
      })
    });
    it('/vue-router.js should be loaded', function(done) {
      request(DOMAIN + '/vue-router.js', function (err, response, body) {
        expect(body).to.include('define(factory);');
        expect(body).to.include('router-view');
        done();
      })
    });
  });
});

describe('Restful Api', function() {
  this.timeout(5000);
  describe('users', function() {
    it('/users/api should return World', function(done) {
      request(DOMAIN + '/api/users', function (err, response, body) {
        body = JSON.parse(body);
        expect(body.status).to.equal('success');
        expect(body.result).to.equal('World');
        done();
      })
    });
  });
});
