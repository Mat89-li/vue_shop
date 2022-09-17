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
  if(to.path==='/login') return next();
  const tokenStr=window.sessionStorage.getItem('token');
  if(!tokenStr){
    return next('/login')
  }else{
    next();
  }
})

export default router
