<template>
  <el-config-provider :locale="currentLangElKey">
    <el-container v-shortkey="['tab']" @shortkey="handleShortKeyTable" class="layout-container-demo" style="margin: -8px;height: calc(100vh - 8px)">
    <el-header>
      <el-row style="height: 100%">
        <el-col :span="6" class="software-title">


          <el-text>
            <SvgIcon name="link" class="logo-color" color="#66ccff"></SvgIcon>
          </el-text>

          <el-text style="font-size: 22px;font-weight: bold;" class="text-color">&nbsp;KubeLink</el-text>
        </el-col>

        <el-col :span="18" class="toolbar flex gap-2" style="text-align: right">
<!--          <el-text class="mx-1 " style="margin-right: 10px" ><el-icon><Opportunity /></el-icon>V1.2.6</el-text>-->

<!--          <el-tag v-if="activeConnection.id" type="primary">K8S Version: V{{ activeConnection.clusterVersionInfo.major }}.{{ activeConnection.clusterVersionInfo.minor }}</el-tag>-->
<!--          <el-tag v-if="activeConnection.id" type="primary">Platform: {{ activeConnection.clusterVersionInfo.platform }}</el-tag>-->

          <el-dropdown style="margin-right: 15px" >
            <span class="el-dropdown-link" @click="updateClusterConfig">
              <i  :class="['main-icon','bi','bi-record2',connectionStatusClass]"></i>
              <el-text class="main-font"  style="max-width: 120px;" truncated>{{ activeConnection.name}}</el-text>

              <el-icon class="el-icon--right">
                <arrow-down />
              </el-icon>
            </span>
            <template #dropdown>
              <el-row style="width: 400px;font-size: 16px">
                <el-col :span="12">
                  <el-dropdown-menu>
                  <el-dropdown-item
                      v-for="item in clusterConfigList"
                      @click="handleActiveClusterConfig(item)"
                      :key="item.id"
                      style="height: 27px"
                  >
                    <div class="config-item">
                      <i :class="{'bi':true,'bi-circle-fill':true,'connection-status-healthy':item.id===activeConnection.id}" style="font-size: 10px"></i>
                      <el-text truncated style="font-size: 16px;">{{ item.name }}</el-text>
                    </div>

                  </el-dropdown-item>
                </el-dropdown-menu>
                </el-col>
                <el-col :span="1"></el-col>
                <el-col  :span="10">
                  <p>
                    <i class="bi bi-send-check"></i> {{ activeConnection.status }}
                  </p>
                  <p>
                    <i class="bi bi-git"></i> {{ activeConnection.clusterVersionInfo.gitVersion }}
                  </p>
                  <p>
                    <i class="bi bi-cpu" ></i>
<!--                    <b>platform: </b>-->
                    {{ activeConnection.clusterVersionInfo.platform }}
                  </p>

                </el-col>


              </el-row>



            </template>
          </el-dropdown>

          <el-switch  v-model="isDark" :active-action-icon="Moon" :inactive-action-icon="Sunny" @change="toggleDark">
          </el-switch>


          <el-dropdown style="margin-right: 15px;margin-left: 15px;"  @command="handleChangeLocale" >
            <span class="el-dropdown-link" >
<!--              {{ currentLang }} -->
              <i class="bi bi-translate main-icon" ></i>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item v-for="lang in langs" :command="lang"  :key="lang.key">{{ lang.title }}</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>

          <el-link :underline="false" :href="'https://github.com/xiaoso456/kubelink'">
            <SvgIcon class="logo-github-color" name="github-mark"   />
          </el-link>
        </el-col>
      </el-row>


    </el-header>



    <el-container>
      <el-aside style="max-height: calc(100vh - 60px)" width="collapse" >
        <!--      <el-scrollbar width="100%" style="height: 100vh">-->
        <!--      <el-row>-->
        <el-menu :collapse-transition="false"    class="sidebar-el-menu" router
                 :default-active="$route.path" :collapse="isCollapse"  @open="handleOpen"  @close="handleClose">
          <el-menu-item index="/cluster" >
            <el-icon><SetUp /></el-icon>
            <template #title><a href="#/cluster" >{{t('sidebar.cluster')}}</a></template>

          </el-menu-item>
          <el-menu-item index="/sync">
            <el-icon><Switch /></el-icon>
            <template #title><a href="#/sync" >{{t('sidebar.sync')}}</a></template>
          </el-menu-item>
          <el-menu-item index="/apps" >
            <el-icon><Menu /></el-icon>
            <template #title><a href="#/apps" >{{t('sidebar.apps')}}</a></template>
          </el-menu-item>

          <el-menu-item  index="/network" >
            <el-icon><Connection /></el-icon>
            <template #title><a href="#/network" >{{t('sidebar.network')}}</a></template>
          </el-menu-item>

          <el-menu-item index="/config" >
            <el-icon><Tools /></el-icon>
            <template #title><a href="#/config" >{{t('sidebar.config')}}</a></template>
          </el-menu-item>

          <el-sub-menu index="/resources">
            <template #title>
              <el-icon><i class="bi bi-union"></i></el-icon>
              <span>{{ t('common.resource') }}</span>
            </template>
              <el-menu-item index="/resources/add">
                <el-icon><i class="bi bi-clipboard-plus"></i></el-icon>
                <template #title><a href="#/resources/add" >{{ t('common.add-resource') }}</a></template>
              </el-menu-item>
<!--              <el-menu-item index="/resources/helm">-->
<!--                <el-icon><i class="bi bi-yelp"></i></el-icon>-->
<!--                <template #title><a href="#/resources/helm" >Helm</a></template>-->
<!--              </el-menu-item>-->

          </el-sub-menu>


          <el-menu-item index="/template" >
            <el-icon><ChatLineSquare /></el-icon>
            <template #title><a href="#/template" >{{t('sidebar.template')}}</a></template>
          </el-menu-item>

          <li style="flex:1;"></li>
          <el-menu-item index="collapse"  @click="isCollapse = !isCollapse" >
            <el-icon v-if="isCollapse"><Expand /></el-icon>
            <el-icon v-else><Fold /></el-icon>
            <template #title>
              <p v-if="isCollapse">{{t('sidebar.extend')}}</p>
              <p v-else>{{t('sidebar.fold')}}</p>
            </template>
          </el-menu-item>
          <!--          <el-sub-menu index="1" >-->
          <!--            <template #title >-->
          <!--              <el-icon><setting /></el-icon>       <h4 @click="()=>{this.$router.push('/cluster')}" class="mb-2">Config</h4>-->

          <!--            </template>-->

          <!--              <el-menu-item index="1-1" @click="()=>{this.$router.push('/cluster')}" ><el-icon><SetUp /></el-icon>cluster config</el-menu-item>-->
          <!--              <el-menu-item index="1-2" @click="()=>{this.$router.push('/sync')}"  ><el-icon><Refresh /></el-icon>sync config</el-menu-item>-->

          <!--          </el-sub-menu>-->

        </el-menu>
        <!--      </el-row>-->
        <!--      <el-row justify="center">-->
        <!--        <el-button type="text" @click="isCollapse = !isCollapse" class="collapse-btn">-->
        <!--          <el-icon><arrow-right /></el-icon>Extend-->
        <!--        </el-button>-->
        <!--      </el-row>-->



        <!--      </el-scrollbar>-->
      </el-aside>


      <el-main style="max-height: calc(100vh - 60px)">
<!--        <el-scrollbar max-height="1000vh">-->
          <router-view/>
<!--        </el-scrollbar>-->
      </el-main>


    </el-container>
  </el-container>
  </el-config-provider>


</template>

<script  setup>
import {
  ArrowRight,
  Download,
  Expand,
  Menu as IconMenu,
  Message,
  Moon,
  Setting,
  Sunny,
  Upload, UploadFilled
} from '@element-plus/icons-vue'
import {useLocale} from "@/store/langStone.js";
import { langs } from '@/locales/i18nconfig.js'
import { ElConfigProvider } from 'element-plus'
import './style.css'
import {
  apiClusterActive,
  apiClusterConnect,
  apiClusterList,
  apiCurrentClusterStatus
} from "@/services/clusterConfig.js";
import { useDark, useToggle } from '@vueuse/core'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()

const useLocaleStone = useLocale()
let curLocale = useLocaleStone.locale
let currentLang = ref(langs.find((cur) => cur.key === curLocale)?.title || '')
let currentLangElKey = ref(langs.find((cur) => cur.key === curLocale)?.elKey || '')

const isDark = useDark({
  storageKey: 'vue-theme-mode',
  valueDark: 'dark',
  valueLight: 'light',
  disableTransition: true
})


const toggleDark = useToggle(isDark)


const isCollapse = ref(false)
const clusterConfigList = ref([])


const handleChangeLocale = (lang)=>{
 currentLang.value = lang.title
 useLocaleStone.setLocale(lang.key)
 currentLangElKey.value = lang.elKey
}

const handleOpen = (key, keyPath) => {
  // console.log(key, keyPath)
}
const handleClose = (key, keyPath) => {
  // console.log(key, keyPath)
}


const handleShortKeyTable = (event) => {
  isCollapse.value = !isCollapse.value
}

const updateClusterConfig = () => {
  apiClusterList().then(async res => {
    clusterConfigList.value = await res.json()
  }).catch(err =>{
    ElMessage({
      message: "request error: " + err,
      type:'error'
    })
    console.log(err)
  })


}

const handleActiveClusterConfig =  async (item) => {
  await apiClusterActive(item.id).then(async res => {
    const status = res.status
    if (status === 200) {
      await res.text()

      ElMessage({
        message: `active config id [${item.id}] success`,
        type: 'success'
      })
    }

  }).catch(err => {
    ElMessage({
      message: "request error: " + err,
      type: 'error'
    })
    console.log(err)
  })
  await updateActiveConnection()


}

const activeConnection = ref({
  id: '',
  name: '-',
  status: 'unknown',
  clusterVersionInfo: {}
})

const updateActiveConnection = async () => {
  apiCurrentClusterStatus().then(async res => {
    const status = res.status
    if (status === 200) {
      activeConnection.value = await res.json()
    }else{
      activeConnection.value.status = 'unknown'
    }

  }).catch(err => {
    ElMessage({
      message: "request error: " + err,
      type: 'error'
    })
    console.log(err)
    activeConnection.value.status = 'unknown'
  })

}
const connectionStatusClass = ref('connection-status-unknown')
watch(() => activeConnection.value.status, (newValue, oldValue) => {
  connectionStatusClass.value = 'connection-status-' + newValue
})
// 启动定时任务
let intervalRefreshConnectionTask;

function startRefreshConnectionTask() {
  intervalRefreshConnectionTask = setInterval(() => {
    updateActiveConnection()

  }, 5000);
}


function stopRefreshConnectionTask() {
  clearInterval(intervalRefreshConnectionTask);
}


onMounted(()=>{
  startRefreshConnectionTask()
  updateActiveConnection()
  updateClusterConfig()
})

onUnmounted(()=>{
  stopRefreshConnectionTask()
})
</script>

<style lang="scss" scoped>
.layout-container-demo .el-header {
  position: relative;
  /*background-color: #121212;*/
  /*color: var(--el-text-color-primary);*/
}
.layout-container-demo .el-aside {
  color: var(--el-text-color-primary);
  /*background: #161616;*/
}
.layout-container-demo .el-menu {
  border-right: none;
}
.layout-container-demo .el-main {
  padding: 0;
}


.software-title{
  display: inline-flex;
}
.layout-container-demo .toolbar {
  display: inline-flex;
  align-items: center;
  justify-content: right;
  height: 100%;
  right: 20px;
}

.el-aside {
  position: relative;
  height: 100vh;
  /*background-color: #161616 !important;*/
}
.el-tag{
  margin: 5px 10px;
}

.el-dropdown-link {
  cursor: pointer;

  //color: var(--el-color-primary);
  display: flex;
  align-items: center;
  outline: none;
}

.el-switch {
  --el-switch-off-color: #67C23A;
}

/* menu text and icon size*/
.el-menu-item{
  font-size: 18px;
  //font-weight: bold;
}

.el-sub-menu{
  font-size: 18px;
  //font-weight: bold;
}
.el-menu-item [class^=el-icon]{
  font-size: 20px;
}

::v-deep(.none-box .el-select__wrapper){
  box-shadow: none;
}
::v-deep(.none-box .el-input__wrapper) {
  box-shadow: none;
}
:deep(.none-box .el-select__wrapper.is-hovering:not(.is-focused)) {
  box-shadow: none;
}
:deep(.none-box .el-textarea__inner) {
  box-shadow: none;
}

:deep(.none-box .el-input-group__append) {
  box-shadow: none;
  background-color: transparent;
}
:deep(.none-box .el-input-group__prepend) {
  box-shadow: none;
  background-color: transparent;
}

.connection-status-healthy{
  color: #1cb263;
}
.connection-status-unknown{
  color: #6c757d;
}
.connection-status-unhealthy{
  color: #dc3545;
}
.connection-status-connecting{
  color: #ffc107;
}

.config-item{
  display: flex;
  align-items: center; /* 垂直居中 */
  gap: 8px; /* 间距 */
}
//:deep(.el-select__wrapper) {
//  box-shadow: none;
//}
//:deep(.el-select__wrapper.is-focused) {
//  box-shadow: none;
//}
//:deep(.el-select__wrapper.is-hovering:not(.is-focused)) {
//  box-shadow: none;
//}
//
//:deep(.el-input__wrapper) {
//  box-shadow: none;
//}
//:deep(.el-textarea__inner) {
//  box-shadow: none;
//}

.main-icon{
  font-size: var(--main-icon-size);
}
.main-font{
  font-size: var(--main-font-size);
}

.el-sub-menu{
  --el-menu-item-font-size: var(--title-font-size);
}
.el-sub-menu .el-menu-item{
  font-size: var(--sub-title-font-size);
}

</style>
