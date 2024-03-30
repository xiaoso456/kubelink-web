import {createApp} from 'vue'
import './style.css'
import App from './App.vue'
import 'element-plus/theme-chalk/dark/css-vars.css'
import SyncConfigTable from "./components/SyncConfigTable.vue";
import ClusterConfig from "./components/ClusterConfig.vue";
import * as VueRouter from 'vue-router'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

const router = VueRouter.createRouter({
    history: VueRouter.createWebHashHistory(),
    routes: [
        {path: '/', component: ClusterConfig},
        {path: '/sync', component: SyncConfigTable},
        {path: '/cluster', component: ClusterConfig},
        {path: '/:pathMatch(.*)*', redirect: '/'},

    ],
})

const app = createApp(App)
// TODO use auto install
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
  }
app.use(router)
app.mount('#app')