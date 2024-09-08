<template>

  <div class="ml-10 mr-10" v-shortkey="{right:['arrowright'],left:['arrowleft']}" @shortkey="handleArrow" >

    <el-row align="top">
      <el-segmented  @change="updateTableData"  v-model="selectedOptionValue.selectedNetworkOption" :options="networkOptions"  >
        <template #default="{ item }">
          <div  style="min-width: 100px;margin: 5px 0 5px 0" class="flex flex-col items-center gap-2 p-2">
            <el-icon size="20">
              <component :is="{...item.icon}" />
            </el-icon>
            <div>{{ item.label }}</div>
          </div>
        </template>
      </el-segmented>

      <el-tooltip  placement="top-start" effect="light" :content="t('common.refresh-tooltip')">
        <el-button style="margin-left: 10px;" round plain link @click="() => {isAutoRefresh = !isAutoRefresh;updateTableData()}">
          <el-icon size="18px" :class="{'is-loading':isAutoRefresh}" >
            <Refresh />
          </el-icon>
        </el-button >
      </el-tooltip>

    </el-row>



    <el-row class="mt-10" :gutter="20">
      <el-col :span="20"  >
        <el-input
            class="mt-4"
            v-model="searchInput"
            :placeholder="t('common.search-tip')"
            @change="updateTableData"
            clearable
        >
          <template #prepend>
            <el-select
                @click="refreshNamespaceOptions"
                @change="updateTableData"
                v-model="selectedOptionValue.selectedNamespaceOption"
                :placeholder="t('common.all')"
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
      </el-col>
      <el-col :span="4">
      </el-col>
    </el-row>
    <el-row >
      <el-table @sort-change="tableSort"  v-loading="tableLoading" height="75vh" :data="filterTableData.slice((pageCurrent - 1) * pageSize, pageCurrent * pageSize)" class="mt-10">
        <el-table-column :label="t('common.id')" width="80">
          <template #default="scope">
            {{ (pageCurrent - 1 ) * pageSize + (scope.$index + 1) }}

          </template>
        </el-table-column>

        <el-table-column sortable="custom" prop="namespace" :label="t('common.namespace')"  width="180"></el-table-column>

        <el-table-column sortable="custom" prop="name" :label="t('common.name')">
          <template #default="scope">
            <el-link :href="`/#/network/namespace/${scope.row.namespace}/${scope.row.name}`" >{{ scope.row.name }}</el-link>
          </template>
        </el-table-column>

        <el-table-column sortable="custom" prop="type" :label="t('common.type')" width="140" >
          <template #default="scope" >
            <div class="flex flex-wrap gap-4 items-center" >
              <el-select
                  class="none-box"
                  v-model="scope.row.raw.spec.type"
                  placeholder="Select"
                  @change="updateServiceType(scope.row)"
                  size="small"
                  default-first-option
                  filterable
                  allow-create
              >
                <el-option
                    v-for="item in ['NodePort','ClusterIP','LoadBalancer']"
                    :key="item"
                    :label="item"
                    :value="item"
                />
              </el-select>
            </div>

            <!--          <el-input ref="focusRef"   v-model="scope.row.type" @keyup.enter.native="$event.target.blur()"></el-input>-->
            <!--          <p v-else  @click="handleIntoEditMode(scope.$index,scope.row,'type')"  >{{ scope.row.type?scope.row.type:'-' }}</p>-->
          </template>
        </el-table-column>

        <el-table-column sortable="custom" prop="clusterIP" label="ClusterIP"  >
        </el-table-column>

        <el-table-column :label="t('common.mapping')" width="280">
          <template #default="scope">
            <el-row v-for="(item,index) in scope.row.ports">
              {{ portInfoToStr(item) }}
            </el-row>


          </template>
        </el-table-column>

        <el-table-column :label="t('common.operation')" width="140">
          <template #default="scope">
            <!--          <el-button size="small" type="primary" plain @click="handleSuspend(scope.row)">suspend</el-button>-->
            <!--          <el-button size="small" type="success" plain @click="handleActive(scope.$index,scope.row)">edit</el-button>-->
            <el-button size="small" type="danger"  plain @click="handleDelete(scope.row)">{{ t('common.delete') }}</el-button>
          </template>
        </el-table-column>

      </el-table>

    </el-row>
    <el-row class="mt-10" justify="end">
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
import {Coin, Postcard, Search} from "@element-plus/icons-vue";
import {apiNamespaceList} from "@/services/namespace.js";
import {useSelectedOptionValue} from "@/store/appsStore.js";
import {apiServiceDelete, apiServiceList, apiServiceUpdate} from "@/services/service.js";
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
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

const networkOptions = ref([
  {
    label: 'Service',
    value: 'Service',
    icon: Postcard,
    disabled: false,
    supported: true
  },
  {
    label: 'Ingress',
    value: 'Ingress',
    icon: Coin,
    disabled: false,
    supported: false
  }

])

const namespaceOptions = ref([
  {
    label: 'Namespace1',
    value: 'Namespace1',
  }
])

const networkItemsRaw = ref([])
watch(networkItemsRaw,() => {
  if(!networkItemsRaw.value){
    return []
  }
  let result = networkItemsRaw.value.map(item => {
    let result = {
      namespace: item.metadata.namespace,
      name: item.metadata.name,
      type: item.spec.type,
      clusterIP: item.spec.clusterIP,
      ports: item.spec.ports,
      sessionAffinity: item.spec.sessionAffinity,
      raw: item
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
  networkOptions.value.forEach(item => {
    item.disabled = (item.value !== selectedOptionValue.selectedNetworkOption || !item.supported)
  })
  let wait;
  if (selectedOptionValue.selectedNetworkOption === 'Service') {
    wait = apiServiceList(selectedOptionValue.selectedNamespaceOption, '').then(async res => {
      const resData = await res.json()
      networkItemsRaw.value = resData

    }).catch(err => {
      ElMessage({
        message: "request error: " + err,
        type: 'error'
      })
      console.log(err)
    })

  }
  await wait
  networkOptions.value.forEach(item => {
    item.disabled = !item.supported
  })
  tableLoading.value = false

}


const handleChangeAppType = async (item) => {
  searchInput.value = ''
  await updateTableData(item.value)
}

const portInfoToStr = (portInfo)=>{
  let portInfoStr = portInfo.protocol + " "
  if(portInfo.nodePort){
    portInfoStr += portInfo.nodePort + " → "
  }
  portInfoStr +=  portInfo.port + " → " + portInfo.targetPort
  return portInfoStr
}


const handleDelete = (row) => {
  dialogVisible.value = true
  dialogTitle.value = t("common.tips")
  dialogMessage.value = `Delete ${selectedOptionValue.selectedNetworkOption} '${row.name}'`
  dialogConfirmFuction.value = () => {
    if(selectedOptionValue.selectedNetworkOption === 'Service'){
      apiServiceDelete(row.namespace,row.name).then(async res => {

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
      updateTableData(selectedOptionValue.selectedNetworkOption)
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




</style>