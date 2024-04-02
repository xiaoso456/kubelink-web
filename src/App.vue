<template>
  <el-container class="layout-container-demo" style="margin: -8px">


    <el-aside width="auto">
      <el-scrollbar width="100%" style="height: 100vh">

        <el-menu     class="el-menu-vertical-demo"
                     default-active="1" collapse="false"  @open="handleOpen"  @close="handleClose">
          <el-menu-item index="1" @click="()=>{$router.push('/cluster')}" >
            <el-icon><SetUp /></el-icon>
            <template #title>Cluster</template>
          </el-menu-item>
          <el-menu-item index="2" @click="()=>{$router.push('/sync')}" >
            <el-icon><Refresh /></el-icon>
            <template #title>Sync</template>
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
        </div>
      </el-header>

      <el-main>
        <el-scrollbar>
          <router-view/>
        </el-scrollbar>
      </el-main>

      <el-footer>
        footer
      </el-footer>
    </el-container>
  </el-container>
</template>

<script  setup>
import { Menu as IconMenu, Message, Setting } from '@element-plus/icons-vue'
import {useClusterInfo} from "@/store/clusterStore.js";
import {apiClusterActive} from "@/services/clusterConfig.js";
const clusterInfo = useClusterInfo()

const isCollapse = ref(false)

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
      clusterInfo.activeId = id
      clusterInfo.activeName = name

      ElMessage({
        message:`active config id [${id}] success`,
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
</style>
