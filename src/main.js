import {createApp} from 'vue'
import './style.css'
import App from './App.vue'
import 'element-plus/theme-chalk/dark/css-vars.css'
import '@xterm/xterm/css/xterm.css'
import SyncConfigTable from "./components/SyncConfigTable.vue";
import ClusterConfig from "./components/ClusterConfig.vue";
import Apps from "./components/Apps.vue";
import XtermDiv from "./components/XtermDiv.vue";
import TextTemplate from "./components/TextTemplate.vue";
import VueShortKey from 'vue3-shortkey';
import 'virtual:svg-icons-register'
import * as VueRouter from 'vue-router'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import { createPinia } from 'pinia'
import piniaPersist from 'pinia-plugin-persist'
import AppDetails from "@/components/AppDetails.vue";
import NetworkInfo from "@/components/NetworkInfo.vue";
import ConfigInfo from "@/components/ConfigInfo.vue";
import ConfigDetails from "@/components/ConfigDetails.vue";
import NetworkDetails from "@/components/NetworkDetails.vue";

import i18n from '@/locales/i18nconfig.js'



const router = VueRouter.createRouter({
    history: VueRouter.createWebHashHistory(),
    routes: [
        {path: '/', component: ClusterConfig},
        {path: '/sync', component: SyncConfigTable},
        {path: '/cluster', component: ClusterConfig},
        {path: '/apps', component: Apps},
        {path: '/network',component: NetworkInfo},
        {path: '/config',component: ConfigInfo},
        {path: '/template',component: TextTemplate},
        {path: '/app/namespace/:namespace/:appType/:appName', component: AppDetails},
        {path: '/config/namespace/:namespace/:configType/:configName', component: ConfigDetails},
        {path: '/network/namespace/:namespace/:service', component: NetworkDetails},
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
app.use(VueShortKey,{ prevent: ['input', 'textarea','.cm-content'] })
app.use(i18n)

app.mount('#app')