<template>
  <el-container class="layout-container-demo" style="margin: -8px">
<!--    侧边栏最小高度为屏幕高度-->


    <el-aside width="200px">
      <el-scrollbar>

        <el-menu default-openeds="[1]">
          <el-sub-menu index="1">
            <template #title>
              <el-icon><setting /></el-icon>config
            </template>

              <el-menu-item index="1-1">cluster config</el-menu-item>
              <el-menu-item index="1-2">sync config</el-menu-item>

          </el-sub-menu>

        </el-menu>


      </el-scrollbar>
    </el-aside>

    <el-container>
      <el-header style="text-align: right; font-size: 12px">
        <div class="toolbar">

          header
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

<script lang="ts" setup>
import { Menu as IconMenu, Message, Setting } from '@element-plus/icons-vue'


</script>

<style scoped>
.layout-container-demo .el-header {
  position: relative;
  background-color: var(--el-color-primary-light-8);
  color: var(--el-text-color-primary);
}
.layout-container-demo .el-aside {
  color: var(--el-text-color-primary);
  background: var(--el-color-primary-light-8);
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
  background-color: #324157 !important;
}
</style>
