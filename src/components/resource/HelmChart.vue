<template>
  <div class="mr-10 ml-10"  v-shortkey="{right:['arrowright'],left:['arrowleft']}" @shortkey="handleArrow" >



    <el-row class="mt-10" :gutter="20">
      <el-col :span="20">
        <el-input
            v-model="searchInput"
            style="max-width: 100%"
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

    </el-row>


    <el-row class="mt-10">
      <el-table @sort-change="tableSort"  v-loading="tableLoading" height="75vh" :data="filterTableData.slice((pageCurrent - 1) * pageSize, pageCurrent * pageSize)" >
        <el-table-column :label="t('common.id')" width="80">
          <template #default="scope">
            {{ (pageCurrent - 1 ) * pageSize + (scope.$index + 1) }}
          </template>
        </el-table-column>

        <el-table-column sortable="custom" prop="namespace" :label="t('common.namespace')"  width="180"></el-table-column>

        <el-table-column sortable="custom" prop="name" :label="t('common.name')">

        </el-table-column>

        <el-table-column sortable="custom" prop="status" :label="t('common.status')">

        </el-table-column>

        <el-table-column sortable="custom" prop="version" :label="t('common.version')">

        </el-table-column>

        <el-table-column sortable="custom" prop="modifiedAt" :label="t('common.last-update-time')" >
          <template #default="scope">
            {{ formattedDate(scope.row.modifiedAt) }}
          </template>

        </el-table-column>

        <el-table-column fixed="right" :label="t('common.operation')" width="140">
          <template #default="scope">
            <el-button size="small" type="success" @click="handleExportRelease(scope.row.namespace,scope.row.name)"  plain >{{ t('common.export') }}</el-button>
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
</template>


<script setup>

import {Download, Postcard, Search, Upload} from "@element-plus/icons-vue";
import {useI18n} from "vue-i18n";
import {ref} from "vue";
import {formattedDate} from "@/services/common.js";
import {apiConfigmapList} from "@/services/configmap.js";
import {apiSecretList} from "@/services/secret.js";
import {apiNamespaceList} from "@/services/namespace.js";
import {useSelectedOptionValue} from "@/store/appsStore.js";
import {apiHelmExport, apiHelmList} from "@/services/helm.js";
const { t } = useI18n()
const selectedOptionValue = useSelectedOptionValue()

const searchInput = ref('')
const pageSize = ref(10)
const pageCurrent = ref(1)
const tableLoading = ref(true)
const helmItemsRaw = ref([])
watch(helmItemsRaw,() => {
  if(!helmItemsRaw.value){
    return []
  }

  tableData.value = helmItemsRaw.value
})


const namespaceOptions = ref([
  {
    label: 'Namespace1',
    value: 'Namespace1',
  }
])

const item = {}
const tableData = ref(Array.from({ length: 0 }).fill(item))
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
    } else {
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
const updateTableData = async () => {
  tableLoading.value = true
  let wait = apiHelmList(selectedOptionValue.selectedNamespaceOption, '').then(async res => {
    const resData = await res.json()
    helmItemsRaw.value = resData

  }).catch(err => {
    ElMessage({
      message: "request error: " + err,
      type: 'error'
    })
    console.log(err)
  })
  await wait

  tableLoading.value = false
}

const handleExportRelease = (namespace,release) => {
 apiHelmExport(namespace,release);
}

onMounted(async () => {
  refreshNamespaceOptions()
  updateTableData()
})
</script>

<style scoped>

</style>
