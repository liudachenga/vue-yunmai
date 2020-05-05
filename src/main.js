import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
// 引入全局样式
import './assets/css/global.css'

// 配置tree-table
import TreeTable from 'vue-table-with-tree-grid'
Vue.component('tree-table', TreeTable)

// 配置富文本编辑器
import VueQuillEditor from 'vue-quill-editor'
import 'quill/dist/quill.core.css' // import styles
import 'quill/dist/quill.snow.css' // for snow theme
import 'quill/dist/quill.bubble.css' // for bubble theme
Vue.use(VueQuillEditor, /* { default global options } */)


// 全局配置axios
import axios from 'axios'

// 在挂载之前设置一个请求拦截器,将token添加到请求头的Authorization中
axios.interceptors.request.use(config => {
  // console.log(config)
  config.headers.Authorization = window.sessionStorage.getItem('token')
  // 在最后必须return
  return config
})

// 全局配置的axios挂载到vue的原型对象上
Vue.prototype.$http = axios
// 设置请求根路径
axios.defaults.baseURL = 'http://118.190.160.53:8888/api/private/v1'

// axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'


Vue.config.productionTip = false

// Vue.filter('dataFormat',function(originVal){
//   const dt= new Date(originVal)
//   const y =dt.getFullYear()
//   const m =(dt.getMonth()+1+'').padStart(2,'0')
//   const d =(dt.getDate()+'').padStart(2,'0')

//   const hh =(dt.getHours()+'').padStart(2,'0')
//   const mm =(dt.getMinutes()+'').padStart(2,'0')
//   const ss =(dt.getSeconds()+'').padStart(2,'0')
 
//   return y+'-'+m+'-'+d +'\t'+hh+':'+mm+':'+ss
// })

// 时间过滤器
Vue.filter('format', function(value, arg) {
  function dateFormat(date, format) {
    if (typeof date === "string") {
      var mts = date.match(/(\/Date\((\d+)\)\/)/);
      if (mts && mts.length >= 3) {
        date = parseInt(mts[2]);
      }
    }
    date = new Date(date);
    if (!date || date.toUTCString() == "Invalid Date") {
      return "";
    }
    var map = {
      "M": date.getMonth() + 1, //月份 
      "d": date.getDate(), //日 
      "h": date.getHours(), //小时 
      "m": date.getMinutes(), //分 
      "s": date.getSeconds(), //秒 
      "q": Math.floor((date.getMonth() + 3) / 3), //季度 
      "S": date.getMilliseconds() //毫秒 
    };
    format = format.replace(/([yMdhmsqS])+/g, function(all, t) {
      var v = map[t];
      if (v !== undefined) {
        if (all.length > 1) {
          v = '0' + v;
          v = v.substr(v.length - 2);
        }
        return v;
      } else if (t === 'y') {
        return (date.getFullYear() + '').substr(4 - all.length);
      }
      return all;
    });
    return format;
  }
  return dateFormat(value, arg);
})


new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
