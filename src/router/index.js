import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'
import Welcome from '../components/Welcome.vue'
import Users from '../components/user/Users.vue'
import Roles from '../components/rights/Roles.vue'
import Rights from '../components/rights/Rights.vue'
import Goods from '../components/goods/Goods.vue'
import Params from '../components/goods/Params.vue'
import Categories from '../components/goods/Categories.vue'
import Orders from '../components/order/Orders.vue'
import Reports from '../components/report/Reports.vue'

Vue.use(VueRouter)

const routes = [
  {
    path:'/',
    redirect:'/login'
  },
  {
    path:'/login',
    name:'Login',
    component:Login
  },
  {
    path:'/home',
    name:'Home',
    component:Home,
    children:[
      {path:'/',redirect:'/welcome'},
      {path:'/welcome',component:Welcome},
      {path:'/users',component:Users},
      {path:'/roles',component:Roles},
      {path:'/rights',component:Rights},
      {path:'/goods',component:Goods},
      {path:'/params',component:Params},
      {path:'/categories',component:Categories},
      {path:'/orders',component:Orders},
      {path:'/reports',component:Reports}
    ]
  }
]

const router = new VueRouter({
  mode: 'hash',
  base: process.env.BASE_URL,
  routes
})
// beforeEach路由导航守卫
router.beforeEach((to,from,next)=>{
  //   to 将要访问的路径
  //   from 代表从哪个路径跳转而来
  //   next 是一个函数，表示放行
  //   next() 放行   next('/login') 强制跳转
  // 如果用户访问的登录页，直接放行
  if(to.path === '/login') return next();
  // 从sessionStorage 中获取到  保存的 token 值 
  const tokenStr=window.sessionStorage.getItem('token');
  // 没有token ,强制跳转到登录页
  if(!tokenStr) return next('/login');
  next();
})

export default router
