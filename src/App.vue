<template>
  <el-container class="layout-container-demo" style="margin: -8px;height: calc(100vh - 8px)">


    <el-aside width="auto">
      <el-scrollbar width="100%" style="height: 100vh">

        <el-menu     class="el-menu-vertical-demo"
                     :default-active="$route.path" collapse="false"  @open="handleOpen"  @close="handleClose">
          <el-menu-item index="/cluster" @click="()=>{$router.push('/cluster')}" >
            <el-icon><SetUp /></el-icon>
            <template #title>Cluster</template>
          </el-menu-item>
          <el-menu-item index="/sync" @click="()=>{$router.push('/sync')}" >
            <el-icon><Switch /></el-icon>
            <template #title>Sync</template>
          </el-menu-item>
          <el-menu-item index="/apps" @click="()=>{$router.push('/apps')}" >
            <el-icon><Menu /></el-icon>
            <template #title>Apps</template>
          </el-menu-item>
          <el-menu-item index="/template" @click="()=>{$router.push('/template')}" >
            <el-icon><ChatLineSquare /></el-icon>
            <template #title>Template</template>
          </el-menu-item>
<!--          <el-sub-menu index="1" >-->
<!--            <template #title >-->
<!--              <el-icon><setting /></el-icon>       <h4 @click="()=>{this.$router.push('/cluster')}" class="mb-2">Config</h4>-->

<!--            </template>-->

<!--              <el-menu-item index="1-1" @click="()=>{this.$router.push('/cluster')}" ><el-icon><SetUp /></el-icon>cluster config</el-menu-item>-->
<!--              <el-menu-item index="1-2" @click="()=>{this.$router.push('/sync')}"  ><el-icon><Refresh /></el-icon>sync config</el-menu-item>-->

<!--          </el-sub-menu>-->

        </el-menu>


      </el-scrollbar>
    </el-aside>

    <el-container>
      <el-header style="text-align: right; font-size: 12px">
        <div class="toolbar flex gap-2">
          <el-tag  v-if="clusterInfo.activeId" type="primary">ID :{{ clusterInfo.activeId }}</el-tag>
          <el-tag v-if="clusterInfo.activeName" type="success">Name :{{ clusterInfo.activeName }}</el-tag>

          <el-dropdown style="margin-right: 15px" >
            <span class="el-dropdown-link" @click="updateClusterConfig">
              {{clusterInfo.activeName}}
              <el-icon class="el-icon--right">
                <arrow-down />
              </el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item
                    v-for="item in namespaceList"
                    @click="handleSelectNamespace(item)"
                    :key="item.id"
                >
                  {{ item.name }}
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>


        </div>

      </el-header>

      <el-main>
        <el-scrollbar>
          <router-view/>
        </el-scrollbar>
      </el-main>

<!--      <el-footer>-->
<!--        footer-->
<!--      </el-footer>-->
    </el-container>
  </el-container>
</template>

<script  setup>
import { Menu as IconMenu, Message, Setting } from '@element-plus/icons-vue'
import {useClusterInfo} from "@/store/clusterStore.js";
import {apiClusterActive, apiClusterList} from "@/services/clusterConfig.js";
const clusterInfo = useClusterInfo()

const isCollapse = ref(false)
const namespaceList = ref([])

const handleOpen = (key, keyPath) => {
  console.log(key, keyPath)
}
const handleClose = (key, keyPath) => {
  console.log(key, keyPath)
}
const activeClusterConfig = (id,name) =>{

  apiClusterActive(id).then(async res => {
    const status = res.status
    if(status === 200){
      if(id !== clusterInfo.activeId){
        ElMessage({
          message:`active config id [${id}] success`,
          type:'success'
        })
      }

      clusterInfo.activeId = id
      clusterInfo.activeName = name


    }

  }).catch(err =>{
    ElMessage({
      message: "request error: " + err,
      type:'error'
    })
    console.log(err)
  })
}

const updateClusterConfig = () => {
  apiClusterList().then(async res => {
    namespaceList.value = await res.json()
  }).catch(err =>{
    ElMessage({
      message: "request error: " + err,
      type:'error'
    })
    console.log(err)
  })

}

const handleSelectNamespace = (item) => {
  apiClusterActive(item.id).then(async res => {
    const status = res.status
    if(status === 200){
      clusterInfo.activeId = item.id
      clusterInfo.activeName = item.name

      ElMessage({
        message:`active config id [${item.id}] success`,
        type:'success'
      })
    }

  }).catch(err =>{
    ElMessage({
      message: "request error: " + err,
      type:'error'
    })
    console.log(err)
  })
}

onMounted(()=>{
  if(clusterInfo.activeId){
    activeClusterConfig(clusterInfo.activeId,clusterInfo.activeName)
  }
  updateClusterConfig()
})
</script>

<style scoped>
.layout-container-demo .el-header {
  position: relative;
  background-color: #121212;
  color: var(--el-text-color-primary);
}
.layout-container-demo .el-aside {
  color: var(--el-text-color-primary);
  background: #161616;
}
.layout-container-demo .el-menu {
  border-right: none;
}
.layout-container-demo .el-main {
  padding: 0;
}
.layout-container-demo .toolbar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  right: 20px;
}

.el-aside {
  position: relative;
  height: 100vh;
  background-color: #161616 !important;
}
.el-tag{
  margin: 5px 10px;
}

.el-dropdown-link {
  cursor: pointer;
  color: var(--el-color-primary);
  display: flex;
  align-items: center;
  outline: none;
}
</style>
