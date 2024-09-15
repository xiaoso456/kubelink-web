<template>
  <el-row>
    <el-table style="margin-top: 10px" :data="tableData"  v-loading="tablePodsLoading">

      <el-table-column sortable prop="name" :label="t('common.name')" width="200">
        <template #default="scope">
          <el-tooltip
              effect="light"
              content="Top Left prompts info"
              placement="top-start"
          >
            <template #content >
              <el-table :data="scope.row.podInfo.containers" >
                <el-table-column prop="name" :label="t('common.name')" min-width="240">
                  <template #default="scopeContainer">
                    {{ scope.row.podInfo.containers[scopeContainer.$index].name }}
                  </template>
                </el-table-column>
                <el-table-column :label="t('common.pull-image-policy')" min-width="140">
                  <template #default="scopeContainer">
                    {{ scope.row.podInfo.containers[scopeContainer.$index].imagePullPolicy}}
                  </template>
                </el-table-column>
                <el-table-column show-overflow-tooltip :label="t('common.image')" min-width="140">
                  <template #default="scopeContainer">
                    {{ scope.row.podInfo.containers[scopeContainer.$index].image}}
                  </template>
                </el-table-column>
                <el-table-column  label="Started" >
                  <template #default="scopeContainer">
                    <el-row style="align-items: center">
                      <div :class="scope.row.podInfo.containerStatuses[scopeContainer.$index].started?'circle-green':'circle-red'"></div>
                      {{ scope.row.podInfo.containerStatuses[scopeContainer.$index].started }}

                    </el-row>
                  </template>
                </el-table-column>
                <el-table-column  label="Ready" >
                  <template #default="scopeContainer">
                    <el-row style="align-items: center">
                      <div :class="scope.row.podInfo.containerStatuses[scopeContainer.$index].ready?'circle-green':'circle-red'"></div>

                      {{ scope.row.podInfo.containerStatuses[scopeContainer.$index].ready }}
                    </el-row>

                  </template>
                </el-table-column>
                <el-table-column  :label="t('common.restart-count')"  width="120">
                  <template #default="scopeContainer">
                    {{ scope.row.podInfo.containerStatuses[scopeContainer.$index].restartCount }}
                  </template>
                </el-table-column>
                <el-table-column  :label="t('common.started-at')" width="180">
                  <template #default="scopeContainer">
                    {{ formattedDate(
                      // todo use func instead
                      scope.row.podInfo.containerStatuses[scopeContainer.$index].state.running?scope.row.podInfo.containerStatuses[scopeContainer.$index].state.running.startedAt:''
                  )
                    }}
                  </template>
                </el-table-column>
                <el-table-column  :label="t('common.operation')" width="180">
                  <template #default="scopeContainer">
                    <el-button size="small" type="success" plain @click="()=>{
                          $router.push('/pod/namespace/'+scope.row.namespace+'/pod/'+scope.row.podInfo.podName+'/container/'+scope.row.podInfo.containers[scopeContainer.$index].name + '/Console')
                        } ">{{ t('common.console') }}</el-button>

                    <el-button size="small" type="primary" plain @click="()=>{
                          $router.push('/pod/namespace/'+scope.row.namespace+'/pod/'+scope.row.podInfo.podName+'/container/'+scope.row.podInfo.containers[scopeContainer.$index].name + '/Logs')
                        } ">{{ t('common.logs') }}</el-button>


                  </template>
                </el-table-column>
              </el-table>
            </template>

            {{ scope.row.name }}
          </el-tooltip>
        </template>
      </el-table-column>


      <el-table-column sortable :label="t('common.node')" >
        <template #default="scope">
          {{ scope.row.nodeName  }}({{ scope.row.hostIP}})
        </template>
      </el-table-column>

      <el-table-column sortable  :label="t('common.status')" >
        <template #default="scope">
          <el-row  style="align-items: center">
            <div :class="{'circle-green':   scope.row.status==='Running' , 'circle-yellow':   scope.row.status==='Pending' , 'circle-red':   scope.row.status==='Failed','circle-grey':   scope.row.status==='Succeeded'}">
            </div>
            {{ scope.row.status  }}
          </el-row>
        </template>
      </el-table-column>

      <el-table-column sortable prop="podIP" label="PodIP" >
        <template #default="scope">

          {{ scope.row.podInfo.podIP  }}
        </template>
      </el-table-column>

      <el-table-column sortable prop="restartTimes" :label="t('common.restart-times')" >

      </el-table-column>

      <el-table-column sortable :label="t('common.created-time')" width="180">
        <template #default="scope">
          {{ formattedDate(scope.row.CreatedTime)  }}
        </template>

      </el-table-column>

      <el-table-column  :label="t('common.operation')" width="280">
        <template #default="scope">
          <el-button size="small" type="success"
                     plain @click="()=>{
                          $router.push('/pod/namespace/'+scope.row.namespace+'/pod/'+scope.row.podInfo.podName+'/container/_null/Console')
                        } ">{{ t('common.console') }}
          </el-button>

          <el-button size="small" type="primary" plain @click="()=>{
                          $router.push('/pod/namespace/'+scope.row.namespace+'/pod/'+scope.row.podInfo.podName+'/container/_null/Logs')
                        } ">{{ t('common.logs') }}
          </el-button>
          <el-button size="small" type="danger" plain @click="handleDeletePod(scope.row)">{{ t('common.delete') }}
          </el-button>

        </template>
      </el-table-column>
    </el-table>

  </el-row>
  <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="500"
  >
    <span>{{ dialogMessage }}</span>
    <template #footer>
      <div class="dialog-footer">
        <el-button plain @click="dialogVisible = false">{{ t('common.cancel') }}</el-button>
        <el-button plain type="success" @click="dialogConfirmFuctionLast">
          {{ t('common.confirm') }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import {ref} from "vue";
import {formattedDate} from "@/services/common.js";
import {useI18n} from "vue-i18n";
import {apiPodDelete} from "@/services/pod.js";
const props = defineProps({
  tablePodsData: {
    type: Array,
    default: ()=>[]
  },
  tablePodsLoading: {
    type: Boolean,
    default: true
  }
})

const rawPodToTableData = (podList) => {
  return podList.map(item => {
    return {
      name: item.metadata.name,
      nodeName: item.spec.nodeName,
      hostIP: item.status.hostIP,
      status: item.status.phase,
      namespace: item.metadata.namespace,
      podInfo: {
        podName: item.metadata.name,
        podIP: item.status.podIP,
        containers: item.spec.containers,
        containerStatuses: item.status.containerStatuses,
        conditions: item.status.conditions
      },
      createdTime: item.metadata.creationTimestamp,
      restartTimes: item.status.containerStatuses == null ? 0 : item.status.containerStatuses[0].restartCount

    }
  })
}
const tableData = ref(rawPodToTableData(props.tablePodsData))

watch(()=>props.tablePodsData, ()=>{
  tableData.value = rawPodToTableData(props.tablePodsData)
})


const { t } = useI18n()
const dialogVisible = ref(false)
const dialogTitle = ref('')
const dialogMessage = ref('')
const dialogConfirmFuction = ref(() => {dialogVisible.value = false})
const dialogConfirmFuctionLast = ref(()=>{dialogVisible.value = false;dialogConfirmFuction.value()})
const handleDeletePod = (row) => {
  dialogVisible.value = true
  dialogTitle.value = "Tips"
  dialogMessage.value = `Delete pod '${row.name}' `
  dialogConfirmFuction.value = () => {
    apiPodDelete(row.namespace,row.name).then(async res => {

      if(res.status === 200){
        ElMessage({
          message: "delete pod success",
          type: 'success'
        })

      }else{
        let errorMessage = await res.text()
        ElMessage({
          message: errorMessage,
          type: 'error'
        })
      }
    }).catch(err => {
      ElMessage({
        message: "request error: " + err,
        type: 'error'
      })
      console.log(err)
    })
  }
}
</script>

<style scoped>

</style>