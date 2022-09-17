import Vue from 'vue'
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import App from './App.vue'
import router from './router'
//导入全局样式
import './assets/css/public.css'
// 导入图标
import './assets/fonts/iconfont.css'
import axios from 'axios'
import TreeTable from 'vue-table-with-tree-grid'
 
Vue.component('tree-table', TreeTable)
Vue.use(ElementUI);
Vue.config.productionTip = false
// 配置请求的根路径
axios.defaults.baseURL='http://47.107.71.208:81/api/private/v1/'
// 请求拦截
axios.interceptors.request.use( config => {
  // console.log("config",config);
  config.headers.Authorization=window.sessionStorage.getItem('token');
  // 最后必须 return config
  return config
})
Vue.prototype.$http=axios;
// 时间格式
Vue.filter("dateFormat",function(dateParams){
  const dt=new Date(dateParams)
  const y=dt.getFullYear()
  const m=(dt.getMonth()+1+'').padStart(2,'0')
  const d=(dt.getDate()+'').padStart(2,'0')
  const hour=(dt.getHours()+'').padStart(2,'0')
  const minute=(dt.getMinutes()+'').padStart(2,'0')
  const seconds=(dt.getSeconds()+'').padStart(2,'0')
  return `${y}-${m}-${d} ${hour}:${minute}:${seconds}`
})


new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
