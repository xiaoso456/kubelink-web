<template>

  <div v-shortkey="{right:['arrowright'],left:['arrowleft']}" @shortkey="handleArrow" >

    <el-row align="top">
      <el-segmented  @change="updateTableData" class="common-margin" v-model="selectedOptionValue.selectedConfigOption" :options="configOptions"  >
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
      <el-table-column label="Id" width="80">
        <template #default="scope">
          {{ scope.$index + 1  }}
        </template>
      </el-table-column>

      <el-table-column sortable="custom" prop="namespace" label="Namespace"  width="180"></el-table-column>

      <el-table-column sortable="custom" prop="name" label="Name">
        <template #default="scope">
          <el-link :href="`/#/config/namespace/${scope.row.namespace}/${selectedOptionValue.selectedConfigOption}/${scope.row.name}`" >{{ scope.row.name }}</el-link>
        </template>
      </el-table-column>

      <el-table-column  key="DataCount"  label="DataCount" >
        <template #default="scope">
          {{ scope.row.data? Object.keys( scope.row.data).length :0 }}
        </template>
      </el-table-column>

      <el-table-column  v-if="selectedOptionValue.selectedConfigOption === 'ConfigMap'" key="BinaryDataCount" label="BinaryDataCount"  >
        <template #default="scope">
          {{ scope.row.binaryData? Object.keys( scope.row.binaryData).length:0 }}
        </template>
      </el-table-column>



      <el-table-column   v-if="selectedOptionValue.selectedConfigOption === 'Secret'"  key="StringDataCount"  label="StringDataCount"  >
        <template #default="scope">
          {{ scope.row.stringData? Object.keys( scope.row.stringData).length : 0 }}
        </template>
      </el-table-column>

      <el-table-column sortable="custom" prop="creationTimestamp" label="createTime" >
        <template #default="scope">
          {{ formattedDate(scope.row.creationTimestamp) }}
        </template>

      </el-table-column>

      <el-table-column label="Operation" width="140">
        <template #default="scope">
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
import {ref} from "vue";
import {Coin, Postcard, Reading, Stopwatch,Search} from "@element-plus/icons-vue";
import {apiNamespaceList} from "@/services/namespace.js";
import {useSelectedOptionValue} from "@/store/appsStore.js";
import {apiServiceDelete, apiServiceList, apiServiceUpdate} from "@/services/service.js";
import {apiDeploymentDelete} from "@/services/deployment.js";
import {apiStatefulsetDelete} from "@/services/statefulset.js";
import {apiDaemonsetDelete} from "@/services/daemonset.js";
import {apiJobDelete} from "@/services/job.js";
import {apiClusterUpdate} from "@/services/clusterConfig.js";
import {apiConfigmapDelete, apiConfigmapList} from "@/services/configmap.js";
import {formattedDate} from "@/services/common.js";
import {apiSecretDelete, apiSecretList} from "@/services/secret.js";

const selectedOptionValue = useSelectedOptionValue()

// const selectedNamespaceOptionValue = ref('')
const searchInput = ref('')
const dialogVisible = ref(false)
const dialogTitle = ref('')
const dialogMessage = ref('')
const dialogConfirmFuction = ref(() => {dialogVisible.value = false})
const dialogConfirmFuctionLast = ref(()=>{dialogVisible.value = false;dialogConfirmFuction.value()})
const tableLoading = ref(true)
const isAutoRefresh = ref(false)

const tableEditIndex = ref(-1)
const tableEditFieldName = ref('')
const focusRef = ref(null);

const pageSize = ref(10)
const pageCurrent = ref(1)



const configOptions = ref([
  {
    label: 'ConfigMap',
    value: 'ConfigMap',
    icon: Postcard,
    disabled: false,
    supported: true
  },
  {
    label: 'Secret',
    value: 'Secret',
    icon: Coin,
    disabled: false,
    supported: true
  }

])

const namespaceOptions = ref([
  {
    label: 'Namespace1',
    value: 'Namespace1',
  }
])

const configmapItemsRaw = ref([])
watch(configmapItemsRaw,() => {
  if(!configmapItemsRaw.value){
    return []
  }
  let result = configmapItemsRaw.value.map(item => {
    let result = {
      namespace: item.metadata.namespace,
      name: item.metadata.name,
      data: item.data,
      binaryData: item.binaryData,
      creationTimestamp: item.metadata.creationTimestamp,
    }
    return result
  }).sort((a,b) => {
    return a.name.localeCompare(b.name)
  })

  tableData.value = result
})

const secretItemsRaw = ref([])
watch(secretItemsRaw,() => {
  if(!secretItemsRaw.value){
    return []
  }
  let result = secretItemsRaw.value.map(item => {
    let result = {
      namespace: item.metadata.namespace,
      name: item.metadata.name,
      data: item.data,
      stringData: item.stringData,
      creationTimestamp: item.metadata.creationTimestamp,
    }
    return result
  }).sort((a,b) => {
    return a.name.localeCompare(b.name)
  })

  tableData.value = result
})


const tableData = ref([])


// const tableData = ref(Array.from({length: 0}).fill(item))
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
  console.log(tableData.value)
  tableData.value.sort((a, b) => {
    if (sortInfo.order === "ascending" || sortInfo.order === null) {

      if(typeof a[sortField] === 'string'){
        return a[sortField].localeCompare(b[sortField]);
      }else if(typeof a[sortField] === 'number'){
        return a[sortField] - b[sortField];
      }

    }else{
      if(typeof a[sortField] === 'string'){
        return b[sortField].localeCompare(a[sortField]);
      }else if(typeof a[sortField] === 'number'){
        return b[sortField] - a[sortField];
      }
    }
  });

};

const handleIntoEditMode = (index, row, propName) => {
  tableEditIndex.value = index
  tableEditFieldName.value = propName
  setTimeout(() => {
    focusRef.value.focus()
  }, 10)

}

const updateServiceType = async (row) => {
  let wait;
  wait = apiServiceUpdate(row.namespace, row.name, row.raw).then(async res => {


    if (res.status === 200) {
      ElMessage({
        message: "update success",
        type: 'success'
      })

    } else {
      const resData = await res.text()

      ElMessage({
        message: "request error: " + JSON.stringify(resData),
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
  await wait;
  updateTableData()

}



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
  configOptions.value.forEach(item => {
    item.disabled = (item.value !== selectedOptionValue.selectedConfigOption || !item.supported)
  })
  let wait;
  if (selectedOptionValue.selectedConfigOption === 'ConfigMap') {
    wait = apiConfigmapList(selectedOptionValue.selectedNamespaceOption, '').then(async res => {
      const resData = await res.json()
      configmapItemsRaw.value = resData

    }).catch(err => {
      ElMessage({
        message: "request error: " + err,
        type: 'error'
      })
      console.log(err)
    })

  }else if (selectedOptionValue.selectedConfigOption === 'Secret') {
    wait = apiSecretList(selectedOptionValue.selectedNamespaceOption, '').then(async res => {
      const resData = await res.json()
      secretItemsRaw.value = resData

    }).catch(err => {
      ElMessage({
        message: "request error: " + err,
        type: 'error'
      })
      console.log(err)
    })

  }
  await wait
  configOptions.value.forEach(item => {
    item.disabled = !item.supported
  })
  tableLoading.value = false

}


const handleChangeAppType = async (item) => {
  searchInput.value = ''
  await updateTableData(item.value)
}



const handleDelete = (row) => {
  dialogVisible.value = true
  dialogTitle.value = "Tips"
  dialogMessage.value = `Delete ${selectedOptionValue.selectedConfigOption} '${row.name}'`
  dialogConfirmFuction.value = () => {
    if(selectedOptionValue.selectedConfigOption === 'ConfigMap'){
      apiConfigmapDelete(row.namespace,row.name).then(async res => {

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
    }else if(selectedOptionValue.selectedConfigOption === 'Secret'){
      apiSecretDelete(row.namespace,row.name).then(async res => {

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
      updateTableData(selectedOptionValue.selectedConfigOption)
    }, 2000)
  }

}


onMounted(async () => {
  refreshNamespaceOptions()
  await handleChangeAppType({
    label: 'Service',
    value: 'Service',
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