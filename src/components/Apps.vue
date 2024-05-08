<template>
  <div>

    <el-segmented @change="updateTableData" class="common-margin" v-model="selectedOptionValue" :options="appTypeOptions"  >
      <template #default="{ item }">
        <div  style="min-width: 100px;margin: 5px 0 5px 0" class="flex flex-col items-center gap-2 p-2">
          <el-icon size="20">
            <component :is="item.icon" />
          </el-icon>
          <div>{{ item.label }}</div>
        </div>
      </template>
    </el-segmented>



    <div class="mt-4 common-margin" >
      <el-input
          v-model="searchInput"
          style="max-width: 100%"
          placeholder="Please input"
          class="input-with-select"
          @change="updateTableData"
          clearable
      >
        <template #prepend>
          <el-select
              @click="refreshNamespaceOptions"
              @change="updateTableData"
              v-model="selectedNamespaceOptionValue"
              placeholder="All"
              style="width: 200px"
              default-first-option
              filterable
              allow-create
              clearable
          >
            <el-option
                v-for="item in namespaceOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
            />

          </el-select>
        </template>
        <template #append>
          <el-button @click="updateTableData" :icon="Search" />
        </template>
      </el-input>
    </div>



    <el-table  v-loading="tableLoading" height="65vh" :data="tableData" class="common-margin common-width">
      <el-table-column label="Id" width="80"   >
        <template #default="scope">
          {{ scope.$index + 1  }}
        </template>
      </el-table-column>

      <el-table-column sortable prop="namespace" label="Namespace" width="180" />

      <el-table-column sortable prop="name" label="name" width="240" >
        <template #default="scope">
          <el-link :href="`/#/app/namespace/${scope.row.namespace}/${selectedOptionValue}/${scope.row.name}`" >{{ scope.row.name }}</el-link>
        </template>
      </el-table-column>

      <el-table-column sortable prop="status" label="Status" width="100" >
        <template #default="scope" >
          <div style="display: flex;align-items: center">
            <div :class="scope.row.status.runNum===scope.row.status.totalNum?'circle-green':'circle-yellow'"></div>
            <el-text>{{ scope.row.status.runNum }}/{{ scope.row.status.totalNum }}</el-text>
          </div>
        </template>
      </el-table-column>

      <el-table-column label="Operation">
        <template #default="scope">
          <el-button size="small" type="primary" plain @click="handleSuspend(scope.row)">suspend</el-button>
<!--          <el-button size="small" type="success" plain @click="handleActive(scope.$index,scope.row)">edit</el-button>-->
<!--          <el-button size="small" type="danger"  plain @click="handleDelete(scope.$index,scope.row)">delete</el-button>-->
        </template>
      </el-table-column>

    </el-table>

  </div>
  <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="500"
  >
    <span>{{ dialogMessage }}</span>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogVisible = false">Cancel</el-button>
        <el-button type="primary" @click="dialogConfirmFuctionLast">
          Confirm
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref } from 'vue'
import {
  Postcard,
  Coin,
  Reading, Search
} from '@element-plus/icons-vue'
import {apiNamespaceList} from "@/services/namespace.js";
import {apiDeploymentContainerSuspend, apiDeploymentList} from "@/services/deployment.js";
import {apiStatefulsetContainerSuspend, apiStatefulsetList} from "@/services/statefulset.js";
import {apiDaemonsetContainerSuspend, apiDaemonsetList} from "@/services/daemonset.js";

const selectedOptionValue = ref('Deployment')
const selectedNamespaceOptionValue = ref('')
const searchInput = ref('')
const dialogVisible = ref(false)
const dialogTitle = ref('')
const dialogMessage = ref('')
const dialogConfirmFuction = ref(() => {dialogVisible.value = false})
const dialogConfirmFuctionLast = ref(()=>{dialogVisible.value = false;dialogConfirmFuction.value()})
const tableLoading = ref(true)

const appTypeOptions = [
  {
    label: 'Deployment',
    value: 'Deployment',
    icon: Postcard,
  },
  {
    label: 'Statefulset',
    value: 'Statefulset',
    icon: Coin,
  },
  {
    label: 'Daemonset',
    value: 'Daemonset',
    icon: Reading,
  }
]

const namespaceOptions = ref([
  {
    label: 'Namespace1',
    value: 'Namespace1',
  }
])
const item = {
  name: 'remote-k8s',
  namespace: 'default',
  status: {
    runNum: 1,
    totalNum: 2,
  }
}
const tableData = ref(Array.from({length: 0}).fill(item))

const refreshNamespaceOptions = () => {
  apiNamespaceList().then(async res => {
    const resData = await res.json()
    namespaceOptions.value = resData.map(item => {
      return {
        value: item.metadata.name,
        label: item.metadata.name
      }
    })
  }).catch(err => {
    ElMessage({
      message: "request error: " + err,
      type: 'error'
    })
    console.log(err)
  })

}

const updateTableData = async () => {
  tableLoading.value = true
  if (selectedOptionValue.value === 'Deployment') {
    apiDeploymentList(selectedNamespaceOptionValue.value, searchInput.value).then(async res => {
      const resData = await res.json()
      tableData.value = resData.map(item => {
        return {
          name: item.metadata.name,
          namespace: item.metadata.namespace,
          status: {
            runNum: item.status.availableReplicas === undefined ? 0 : item.status.availableReplicas,
            totalNum: item.spec.replicas,
          }
        }
      })
    }).catch(err => {
      ElMessage({
        message: "request error: " + err,
        type: 'error'
      })
      console.log(err)
    })
  } else if (selectedOptionValue.value === 'Statefulset') {
    apiStatefulsetList(selectedNamespaceOptionValue.value, searchInput.value).then(async res => {
      const resData = await res.json()
      tableData.value = resData.map(item => {
        return {
          name: item.metadata.name,
          namespace: item.metadata.namespace,
          status: {
            runNum: item.status.availableReplicas,
            totalNum: item.spec.replicas,
          }
        }
      })
    }).catch(err => {
      ElMessage({
        message: "request error: " + err,
        type: 'error'
      })
      console.log(err)
    })
  } else if (selectedOptionValue.value === 'Daemonset') {
    apiDaemonsetList(selectedNamespaceOptionValue.value, searchInput.value).then(async res => {
      const resData = await res.json()
      tableData.value = resData.map(item => {
        return {
          name: item.metadata.name,
          namespace: item.metadata.namespace,
          status: {
            runNum: item.status.numberAvailable,
            totalNum: item.status.desiredNumberScheduled,
          }
        }
      })
    }).catch(err => {
      ElMessage({
        message: "request error: " + err,
        type: 'error'
      })
      console.log(err)
    })
  }
  tableLoading.value = false

}

const handleChangeAppType = (item) => {
  searchInput.value = ''
  updateTableData(item.value)
}

const handleSuspend = (row) => {
  dialogVisible.value = true
  dialogTitle.value = "Tips"
  dialogMessage.value = `Suspend ${selectedOptionValue.value} '${row.name}' first container`
  dialogConfirmFuction.value = () => {
    if(selectedOptionValue.value === 'Deployment'){
      apiDeploymentContainerSuspend(row.namespace,row.name,"_first").then(async res => {
        if(res.status === 200){
          ElMessage({
            message: "success suspend first container",
            type:'success'
          })
        }
      }).catch(err => {
        ElMessage({
          message: "request error: " + err,
          type: 'error'
        })
        console.log(err)
      })
    }else if(selectedOptionValue.value === 'Statefulset'){
      apiStatefulsetContainerSuspend(row.namespace,row.name,"_first").then(async res => {
        if(res.status === 200){
          ElMessage({
            message: "success suspend first container",
            type:'success'
          })
        }
      }).catch(err => {
        ElMessage({
          message: "request error: " + err,
          type: 'error'
        })
        console.log(err)
      })
    }else if(selectedOptionValue.value === 'Daemonset'){
      apiDaemonsetContainerSuspend(row.namespace,row.name,"_first").then(async res => {
        if(res.status === 200){
          ElMessage({
            message: "success suspend first container",
            type:'success'
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



}


onMounted(async () => {
  refreshNamespaceOptions()
  await handleChangeAppType({
    label: 'Deployment',
    value: 'Deployment',
    icon: Postcard,
  })
})

</script>

<style scoped>
.common-margin{
  margin: 0 10px 10px 10px;
}
.common-width{
  width: calc(100% - 20px);

}

.circle-green {
  background: rgba(65, 145, 107, 0.99);
  border: 0.1875em solid rgba(65, 145, 107, 0.99);
  border-radius: 40%;
  height: 10px;
  width: 10px;
  margin-right: 3px;
}
.circle-yellow {
  background: rgb(218, 162, 11);
  border: 0.1875em solid rgb(218, 162, 11);
  border-radius: 40%;
  height: 10px;
  width: 10px;
  margin-right: 3px;
}
</style>