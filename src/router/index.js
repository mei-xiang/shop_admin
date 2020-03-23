import Vue from 'vue'
import Router from 'vue-router'
import Login from '@/components/login/Login'
import Home from '@/components/home/Home'
import Users from '@/components/users/Users'
import Rights from '@/components/rights/Rights'
import Roles from '@/components/roles/Roles.vue'
import Categories from '@/components/goods/categories/Categories'
import Params from '@/components/goods/params/Params'
import Goods from '@/components/goods/goods/Goods'
import Add from '@/components/goods/add/Add'
import Orders from '@/components/orders/Orders'
import Reports from '@/components/reports/Reports'

Vue.use(Router)

const router = new Router({
  routes: [
    { path: '/login', component: Login },
    {
      path: '/home',
      component: Home,
      children: [
        { path: 'users', component: Users },
        { path: 'rights', component: Rights },
        { path: 'roles', component: Roles },
        { path: 'categories', component: Categories },
        { path: 'params', component: Params },
        { path: 'goods', component: Goods },
        { path: 'add', component: Add },
        { path: 'orders', component: Orders },
        { path: 'reports', component: Reports }
      ]
    }
  ]
})

// 通过全局导航守卫实现登录拦截
// 判断登录表示token是否存在，存在就让它访问路由对应的组件，否则跳到登录页
router.beforeEach((to, from, next) => {
  // to and from are Route Object,next() must be called to resolve the hook}
  // 判断用户是否登录
  if (to.path === '/login') {
    next()
  } else {
    const token = localStorage.getItem('token')
    if (token) {
      next()
    } else {
      next('/login')
    }
  }
})

export default router
