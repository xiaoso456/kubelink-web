<template>
  <div v-shortkey="{right:['arrowright'],left:['arrowleft']}" @shortkey="handleArrow" >

    <el-row align="top">
      <el-segmented  @change="updateTableData" class="common-margin" v-model="selectedOptionValue.selectedOption" :options="appTypeOptions"  >
        <template #default="{ item }">
          <div  style="min-width: 100px;margin: 5px 0 5px 0" class="flex flex-col items-center gap-2 p-2">
            <el-icon size="20">
              <component :is="{...item.icon}" />
            </el-icon>
            <div>{{ item.label }}</div>
          </div>
        </template>
      </el-segmented>

      <el-tooltip  placement="top-start" effect="light" content="Refresh data every 10s">
        <el-button style="margin-left: 10px;" round plain link @click="() => {isAutoRefresh = !isAutoRefresh;updateTableData()}">
          <el-icon size="18px" :class="{'is-loading':isAutoRefresh}" >
            <Refresh />
          </el-icon>
        </el-button >
      </el-tooltip>

    </el-row>




    <div class="mt-4 common-margin" >
      <el-input
          v-model="searchInput"
          style="max-width: 100%"
          placeholder="Please input"
          @change="updateTableData"
          clearable
      >
        <template #prepend>
          <el-select
              @click="refreshNamespaceOptions"
              @change="updateTableData"
              v-model="selectedOptionValue.selectedNamespaceOption"
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



    <el-table @sort-change="tableSort"  v-loading="tableLoading" height="75vh" :data="filterTableData.slice((pageCurrent - 1) * pageSize, pageCurrent * pageSize)" class="common-margin common-width">
      <el-table-column label="Id" width="80"   >
        <template #default="scope">
          {{ scope.$index + 1  }}
        </template>
      </el-table-column>

      <el-table-column sortable="custom" prop="namespace" label="Namespace"  />

      <el-table-column sortable="custom" prop="name" label="Name">
        <template #default="scope">
          <el-link :href="`/#/app/namespace/${scope.row.namespace}/${selectedOptionValue.selectedOption}/${scope.row.name}`" >{{ scope.row.name }}</el-link>
        </template>
      </el-table-column>

      <el-table-column sortable="custom" prop="status" label="Status" width="120" >
        <template #default="scope" >
          <div style="display: flex;align-items: center">
            <div :class="scope.row.status.runNum===scope.row.status.totalNum?'circle-green':'circle-yellow'"></div>
            <el-text>{{ scope.row.status.runNum }}/{{ scope.row.status.totalNum }}</el-text>
          </div>
        </template>
      </el-table-column>

      <el-table-column label="Operation" width="200">
        <template #default="scope">
          <el-button size="small" type="primary" plain @click="handleSuspend(scope.row)">suspend</el-button>
<!--          <el-button size="small" type="success" plain @click="handleActive(scope.$index,scope.row)">edit</el-button>-->
          <el-button size="small" type="danger"  plain @click="handleDelete(scope.row)">delete</el-button>
        </template>
      </el-table-column>

    </el-table>
    <el-row justify="end">
      <el-pagination
          v-model:current-page="pageCurrent"
          v-model:page-size="pageSize"
          :page-sizes="[5, 10, 20, 50]"
          layout="total,sizes, prev, pager, next"
          :total="filterTableData.length"

      />
    </el-row>
  </div>
  <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="500"
  >
    <span>{{ dialogMessage }}</span>
    <template #footer>
      <div class="dialog-footer">
        <el-button plain @click="dialogVisible = false">Cancel</el-button>
        <el-button plain type="success" @click="dialogConfirmFuctionLast">
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
  Reading, Search, Stopwatch, Refresh
} from '@element-plus/icons-vue'
import {apiNamespaceList} from "@/services/namespace.js";
import {
  apiDeploymentContainerSuspend,
  apiDeploymentDelete,
  apiDeploymentList
} from "@/services/deployment.js";
import {apiStatefulsetContainerSuspend, apiStatefulsetDelete, apiStatefulsetList} from "@/services/statefulset.js";
import {apiDaemonsetContainerSuspend, apiDaemonsetDelete, apiDaemonsetList} from "@/services/daemonset.js";
import {apiJobContainerSuspend, apiJobDelete, apiJobList} from "@/services/job.js";
import {useSelectedOptionValue} from "@/store/appsStore.js";

// const selectedOptionValue = ref('Deployment')
const selectedOptionValue = useSelectedOptionValue()
const searchInput = ref('')
const dialogVisible = ref(false)
const dialogTitle = ref('')
const dialogMessage = ref('')
const dialogConfirmFuction = ref(() => {dialogVisible.value = false})
const dialogConfirmFuctionLast = ref(()=>{dialogVisible.value = false;dialogConfirmFuction.value()})
const tableLoading = ref(true)
const isAutoRefresh = ref(false)

const pageSize = ref(10)
const pageCurrent = ref(1)

const appTypeOptions = ref([
  {
    label: 'Deployment',
    value: 'Deployment',
    icon: Postcard,
    disabled: false
  },
  {
    label: 'Statefulset',
    value: 'Statefulset',
    icon: Coin,
    disabled: false

  },
  {
    label: 'Daemonset',
    value: 'Daemonset',
    icon: Reading,
    disabled: false
  },
  {
    label: 'Job',
    value: 'Job',
    icon: Stopwatch,
    disabled: false
  }
])

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
const filterTableData = computed(() => {
  const filterData = tableData.value.filter(item =>{
    if(searchInput.value === ''){
      return true
    }
    if(item.name && item.name.includes(searchInput.value)){
      return true
    }
  })
  return filterData
})

const tableSort = (sortInfo) => {
  let sortField = sortInfo.prop
  tableData.value.sort((a, b) => {
    if (sortInfo.order === "ascending" || sortInfo.order === null) {

      if (sortField === 'status'){
        return a[sortField].runNum - b[sortField].runNum
      }

      if(typeof a[sortField] === 'string'){
        return a[sortField].localeCompare(b[sortField]);
      }else if(typeof a[sortField] === 'number'){
        return a[sortField] - b[sortField];
      }


    } else {
      if (sortField === 'status'){
        return b[sortField].runNum - a[sortField].runNum
      }
      if(typeof a[sortField] === 'string'){
        return b[sortField].localeCompare(a[sortField]);
      }else if(typeof a[sortField] === 'number'){
        return b[sortField] - a[sortField];
      }
    }

  });

};

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
  // disabled other options
  appTypeOptions.value.forEach(item => {
    item.disabled = (item.value !== selectedOptionValue.selectedOption)
  })
  let wait;
  if (selectedOptionValue.selectedOption === 'Deployment') {
    wait = apiDeploymentList(selectedOptionValue.selectedNamespaceOption, '').then(async res => {
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
  } else if (selectedOptionValue.selectedOption === 'Statefulset') {
    wait = apiStatefulsetList(selectedOptionValue.selectedNamespaceOption, '').then(async res => {
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
  } else if (selectedOptionValue.selectedOption === 'Daemonset') {
    wait = apiDaemonsetList(selectedOptionValue.selectedNamespaceOption, '').then(async res => {
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
  }else if (selectedOptionValue.selectedOption === 'Job') {
    wait = apiJobList(selectedOptionValue.selectedNamespaceOption, '').then(async res => {
      const resData = await res.json()
      tableData.value = resData.map(item => {
        return {
          name: item.metadata.name,
          namespace: item.metadata.namespace,
          status: {
            runNum: item.status.succeeded? item.status.succeeded : 0,
            totalNum: item.spec.completions,
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
  await wait
  appTypeOptions.value.forEach(item => {
    item.disabled = false
  })
  tableLoading.value = false

}

const handleChangeAppType = async (item) => {
  searchInput.value = ''
  await updateTableData(item.value)
}

const handleSuspend = (row) => {
  dialogVisible.value = true
  dialogTitle.value = "Tips"
  dialogMessage.value = `Suspend ${selectedOptionValue.selectedOption} '${row.name}' first container`
  dialogConfirmFuction.value = () => {
    if(selectedOptionValue.selectedOption === 'Deployment'){
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
    }else if(selectedOptionValue.selectedOption === 'Statefulset'){
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
    }else if(selectedOptionValue.selectedOption === 'Daemonset'){
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
    }else if(selectedOptionValue.selectedOption === 'Job'){
      apiJobContainerSuspend(row.namespace,row.name,"_first").then(async res => {
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

const handleDelete = (row) => {
  dialogVisible.value = true
  dialogTitle.value = "Tips"
  dialogMessage.value = `Delete ${selectedOptionValue.selectedOption} '${row.name}'`
  dialogConfirmFuction.value = () => {
    if(selectedOptionValue.selectedOption === 'Deployment'){
      apiDeploymentDelete(row.namespace,row.name).then(async res => {

        ElMessage({
          message: await res.json(),
          type:'success'
        })

      }).catch(err => {
        ElMessage({
          message: "request error: " + err,
          type: 'error'
        })
        console.log(err)
      })
    }else if(selectedOptionValue.selectedOption === 'Statefulset'){
      apiStatefulsetDelete(row.namespace,row.name).then(async res => {

        ElMessage({
          message: await res.json(),
          type:'success'
        })

      }).catch(err => {
        ElMessage({
          message: "request error: " + err,
          type: 'error'
        })
        console.log(err)
      })
    }else if(selectedOptionValue.selectedOption === 'Daemonset'){
      apiDaemonsetDelete(row.namespace,row.name).then(async res => {

        ElMessage({
          message: await res.json(),
          type:'success'
        })

      }).catch(err => {
        ElMessage({
          message: "request error: " + err,
          type: 'error'
        })
        console.log(err)
      })
    }else if(selectedOptionValue.selectedOption === 'Job'){
      apiJobDelete(row.namespace,row.name).then(async res => {

        ElMessage({
          message: await res.json(),
          type:'success'
        })

      }).catch(err => {
        ElMessage({
          message: "request error: " + err,
          type: 'error'
        })
        console.log(err)
      })
    }
    setTimeout(() => {
      updateTableData(selectedOptionValue.selectedOption)
    }, 2000)
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

const handleArrow = (event) =>{
  const allPage = Math.ceil(filterTableData.value.length / pageSize.value)
  switch (event.srcKey) {
    case "right":
      let nextPage = pageCurrent.value + 1
      if(nextPage > allPage){
        nextPage = 1
      }
      pageCurrent.value = nextPage

      break;
    case "left":
      let prevPage = pageCurrent.value - 1
      if(prevPage < 1){
        prevPage = allPage
      }
      pageCurrent.value = prevPage
      break;
  }
}

</script>

<style scoped>
.common-margin{
  margin: 0 10px 10px 10px;
}
.common-width{
  width: calc(100% - 20px);

}


</style>