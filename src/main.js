import Vue from 'vue'
import Cube from 'cube-ui'
import App from './App.vue'
import router from './router'
import store from './store'
import 'babel-polyfill'
import fastclick from 'fastclick'
import './common/stylus/index.styl'
import VueLasyLoad from 'vue-lazyload'

fastclick.attach(document.body)
Vue.use(VueLasyLoad, {
  loading: require('./common/image/default.png')
})
Vue.use(Cube)

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
