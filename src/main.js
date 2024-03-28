import {createApp} from 'vue'
import './style.css'
import App from './App.vue'
import 'element-plus/theme-chalk/dark/css-vars.css'
import SyncConfigTable from "./components/SyncConfigTable.vue";
import * as VueRouter from 'vue-router'

const router = VueRouter.createRouter({
    history: VueRouter.createWebHashHistory(),
    routes: [
        {path: '/', component: SyncConfigTable},
        {path: '/:pathMatch(.*)*', redirect: '/'},

    ],
})

const app = createApp(App)
app.use(router)
app.mount('#app')