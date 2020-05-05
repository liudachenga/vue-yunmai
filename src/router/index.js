import Vue from 'vue'
import VueRouter from 'vue-router'
// 导入登录组件
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'
import Welcome from '../components/Welcome.vue'
import Users from '../components/user/users.vue'
import Roles from '../components/power/Roles.vue'
import Rights from '../components/power/Rights.vue'
import Categories from '../components/goods/Categories.vue'
import Params from '../components/goods/Params.vue'
import List from '../components/goods/List.vue'
import Add from '../components/goods/Add.vue'
import Order from '../components/order/Order.vue'
import Report from '../components/report/Report.vue'

Vue.use(VueRouter)

const router = new VueRouter({
  routes: [
    // 重定向到登录页
    { path: '/', redirect: '/login' },
    // 登录页
    { path: '/login', component: Login },
    {
      path: '/home', component: Home, redirect: '/welcome', children: [
        { path: '/welcome', component: Welcome },
        { path: '/users', component: Users },
        { path: '/roles', component: Roles },
        { path: '/rights', component: Rights },
        { path: '/categories', component: Categories },
        { path: '/params', component: Params },
        { path: '/goods', component: List },
        { path: '/goods/add', component: Add },
        { path: '/orders', component: Order },
        { path: '/reports', component: Report }
      ]
    }
  ]
})

// 添加路由导航守卫
router.beforeEach((to, from, next) => {
  // 如果访问的是登录页,直接放行
  if (to.path === '/login') {
    return next()
  }
  // 获取保存在sessionStorage中的token
  const tokenStr = window.sessionStorage.getItem('token')
  // 判断 如果没有token,那么强制跳转到登录页
  if (!tokenStr) {
    return next('/login')
  }
  next()
})

export default router
