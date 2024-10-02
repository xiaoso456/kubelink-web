
<template>
  <el-row class="mb-10">
    <el-radio-group v-model="selectedAppName" >
      <el-radio-button v-for="app in apps" :label="app.name" :value="app.name" />
    </el-radio-group>
  </el-row>
  <el-scrollbar max-height="70vh">

    <el-row>
      <el-text class="el-descriptions__title">{{ t('common.event') }}</el-text>
    </el-row>
    <el-row >
      <el-table style="margin-top: 10px;" :data="eventInfoListRaw"  v-loading="tablePodsLoading">

        <el-table-column  type="expand">
<!--          <template #default="props">-->
<!--            {{ props.row.message }}-->
<!--          </template>-->
          <template #default="props">

              <h4>Message</h4>
              <p >{{ props.row.message }}</p>

          </template>
        </el-table-column>

        <el-table-column prop="type" :label="t('common.type')" width="120">

        </el-table-column>


        <el-table-column prop="source.host" :label="t('common.node')" >

        </el-table-column>

        <el-table-column  prop="source.component" :label="t('common.source')" >

        </el-table-column>
        <el-table-column  prop="reason" :label="t('common.reason')" >

        </el-table-column>
        <el-table-column  prop="count" :label="t('common.count')" >

        </el-table-column>


        <el-table-column  :label="t('common.first-timestamp')" width="200">
          <template #default="scope">
            <div style="display: flex; align-items: center">
              <el-icon><timer /></el-icon>
              <span style="margin-left: 10px">{{ formattedDate(scope.row.firstTimestamp)  }}</span>
            </div>
          </template>

        </el-table-column>
        <el-table-column  :label="t('common.last-timestamp')" width="200">
          <template #default="scope">
            <div style="display: flex; align-items: center">
              <el-icon><timer /></el-icon>
              <span style="margin-left: 10px">{{ formattedDate(scope.row.lastTimestamp)  }}</span>
            </div>

          </template>

        </el-table-column>


      </el-table>
    </el-row>



  </el-scrollbar>

</template>

<script setup>
import { useI18n } from 'vue-i18n'
import {formattedDate} from "@/services/common.js";
import {apiDeploymentGet} from "@/services/deployment.js";
import {apiStatefulsetGet} from "@/services/statefulset.js";
import {apiDaemonsetGet, apiDaemonsetPodList} from "@/services/daemonset.js";
import {apiJobGet} from "@/services/job.js";
import {apiEventInfo} from "@/services/event.js";
const { t } = useI18n()
const tablePodsLoading = ref(true)
const selectedAppName = ref('app1')
const selectedApp = ref({})

const apps = defineModel('apps')
const eventInfoListRaw = ref([])

onMounted(() => {
  selectedAppName.value = apps.value[0].name

})

watch([selectedAppName,apps], ([newSelectedAppName,newApps])=>{
  if(newSelectedAppName){
    selectedApp.value = newApps.find(item => item.name === newSelectedAppName)

  }else{
    selectedApp.value = newApps[0]
  }
  updateAppEvent()
})

const updateAppEvent = async () => {
  if(!selectedApp.value){
    return
  }
  tablePodsLoading.value = true
  apiEventInfo(selectedApp.value.namespace, selectedApp.value.type,selectedApp.value.name).then(async res => {
    const resData = await res.json()
    eventInfoListRaw.value = resData


  }).catch(err => {
    ElMessage({
      message: "request error: " + err,
      type: 'error'
    })
    console.log(err)
  })
  tablePodsLoading.value = false

}


</script>


<style scoped>

.custom-style .el-row{
  padding-top: 10px;
}

</style>