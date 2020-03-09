import Vue from 'vue'
import Router from 'vue-router'
import Login from '@/components/login/Login'
import Home from '@/components/home/Home'

Vue.use(Router)

const router = new Router({
  routes: [
    { path: '/login', component: Login },
    { path: '/home', component: Home }
  ]
})

// 通过全局导航守卫实现登录拦截
router.beforeEach((to, from, next) => {
  //to and from are Route Object,next() must be called to resolve the hook}
  // 判断用户是否登录
  if (to.path === '/login') {
    next()
  } else {
    const token = localStorage.getItem('token');
    if (token) {
      next()
    } else {
      next('/login')
    }
  }
})

export default router
