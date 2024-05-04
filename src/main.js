import {createApp} from 'vue'
import './style.css'
import App from './App.vue'
import 'element-plus/theme-chalk/dark/css-vars.css'
import '@xterm/xterm/css/xterm.css'
import SyncConfigTable from "./components/SyncConfigTable.vue";
import ClusterConfig from "./components/ClusterConfig.vue";
import Apps from "./components/Apps.vue";
import XtermDiv from "./components/XtermDiv.vue";

import * as VueRouter from 'vue-router'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import { createPinia } from 'pinia'
import piniaPersist from 'pinia-plugin-persist'
import AppDetails from "@/components/AppDetails.vue";

const router = VueRouter.createRouter({
    history: VueRouter.createWebHashHistory(),
    routes: [
        {path: '/', component: ClusterConfig},
        {path: '/sync', component: SyncConfigTable},
        {path: '/cluster', component: ClusterConfig},
        {path: '/apps', component: Apps},
        {path: '/app/namespace/:namespace/:appType/:appName', component: AppDetails},
        {path: '/pod/namespace/:namespace/pod/:pod/container/:container/:action',component: XtermDiv},
        {path: '/:pathMatch(.*)*', redirect: '/'},

    ],
})
const pinia = createPinia()
pinia.use(piniaPersist)
const app = createApp(App)
// TODO use auto install
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
  }
app.use(router)
app.use(pinia)
app.mount('#app')