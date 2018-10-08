import * as promise from 'es6-promise';
import 'babel-polyfill';
import Vue from 'vue';

import 'normalize.css/normalize.css';// A modern alternative to CSS resets

import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';

import '@/styles/index.scss'; // global css

import App from './App';
import router from './router';
import store from './store';

import '@/icons'; // icon
import '@/permission'; // permission control
import waves from '@/directives/waves'; // 水波纹指令
import * as filters from './filters'; // global filter
promise.polyfill();
Vue.use(ElementUI);
Vue.use(waves);

// register global utility filters.
Object.keys(filters).forEach(key => {
  Vue.filter(key, filters[key]);
});

Vue.config.productionTip = false;

new Vue({
  el: '#app',
  router,
  store,
  template: '<App/>',
  components: { App }
});
