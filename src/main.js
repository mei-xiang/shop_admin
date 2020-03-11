// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'

// 导入全局样式
import "@/assets/index.css"

// 导入element-js
import ElementUI from 'element-ui'
// 导入element-css
import 'element-ui/lib/theme-chalk/index.css';

import axios from 'axios'

// 配置请求的公共路径
axios.defaults.baseURL = 'http://localhost:8888/api/private/v1'

// 将axios对象挂载在Vue的原型上，就不用每次在组件中使用axios就要导入
// 每个组件都是Vue的实例
Vue.prototype.$http = axios

// 请求拦截器
// 每次请求都需要在响应头中设置Authorization 的值为token，就可以在请求拦截器中进行设置。因为只要发送请求就会先走请求拦截器
axios.interceptors.request.use(function (config) {
  // 登录请求时不需要设置请求头
  if (!config.url.endsWith('/login')) {
    config.headers.Authorization = localStorage.getItem('token')
  }
  // console.log(config)
  return config
});
// 响应拦截器
// 数据响应之前会进行响应拦截。可以对一些同意要处理的在这进行处理，就不要每次返回了数据进行每次处理
axios.interceptors.response.use(function (response) {
  // 在数据响应前进行拦截，如果返回的数据是无效token进行统一处理
  if (response.data.meta.status === 401) {
    router.push('/login');
    // 删除token
    localStorage.removeItem('token')
  }
  // console.log(response)
  return response
})

// 安装element
Vue.use(ElementUI)

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})
