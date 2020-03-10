// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router';
import iView from 'iview';
import ElementUI from 'element-ui';
import 'iview/dist/styles/iview.css';
import 'element-ui/lib/theme-chalk/index.css';
import store from './store/store';
import './plugins/jquery-3.3.1.min';
import './libs/reload1.css';
import ZkTable from 'vue-table-with-tree-grid'
import axios from 'axios'
import 'babel-polyfill'
import './permission'
import JsonView from 'jsonview-vue'
import elementResizeDetectorMaker from "element-resize-detector"
import 'swiper/css/swiper.css'
Vue.prototype.$axios=axios;
Vue.config.productionTip = false

Vue.use(iView);
Vue.use(ElementUI);
Vue.use(Router);
Vue.use(ZkTable);
Vue.use(JsonView);
Vue.use(elementResizeDetectorMaker);

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})
