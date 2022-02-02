import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'

// 导入全局样式表
import './assets/css/global.css'



// 添加到vue.prototype.$http后,可以在每一个组件上通过this.$http获取axios 
// 不必每个页面都import  axios  $http是自定义的属性名,可以随便起
import axios from 'axios'
// 配置请求的根路径
// axios.defaults.baseURL = 'https://lianghj.top:8888/api/private/v1/'
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
axios.interceptors.request.use(config => {
	// console.log(config)
	config.headers.Authorization = window.sessionStorage.getItem('token')
	// 在最后必须 return config
	return config
})
Vue.prototype.$http = axios


Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
