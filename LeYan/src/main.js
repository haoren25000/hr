// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import store from './store'
//引入mint-ui组件库
import { Swipe, SwipeItem, Lazyload, Header, Button, Loadmore, Checklist, Cell, InfiniteScroll, Spinner, Toast, MessageBox } from 'mint-ui'
//注册头部组件
import MHeader from 'components/header/header'
import 'font-awesome/css/font-awesome.css'
//引入stylus样式
import './assets/style/index.styl'
import './assets/style/my-mint.styl'
//引入flexible 解决移动端适配 1rem等于75px
import 'lib-flexible/flexible'
import normalizeBooks from './dom/BooksDom'
Vue.config.productionTip = false;
Vue.component('Swipe', Swipe);
Vue.component('SwipeItem', SwipeItem);
Vue.component('mt-header', Header);
Vue.component('mt-button', Button);
Vue.component('mt-loadmore', Loadmore);
Vue.component('m-header', MHeader);
Vue.component('mt-checklist', Checklist);
Vue.component('mt-cell', Checklist);
Vue.component('mt-spinner', Spinner);
Vue.component('Toast', Toast);
Vue.component('MessageBox', MessageBox);
Vue.use(Lazyload);
Vue.use(InfiniteScroll);
//统一浏览器的初始样式
Vue.prototype.normalizeBooks = normalizeBooks;


new Vue({
  el: '#app',
  router,
  store,
  components: { App },
  template: '<App/>'
})
