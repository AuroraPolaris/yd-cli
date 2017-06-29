import Vue from 'vue'
import Vuex from 'vuex'
import VueRouter from 'vue-router'
import ElementUI from 'element-ui'
import 'element-ui/theme-default/index.css'
import axios from 'axios'

import App from 'src/App.vue'
import 'global.css'

Vue.use(ElementUI);
Vue.use(VueRouter);

const app = new Vue({
  render: h => h(App)
}).$mount('#app');

