<template>

  <div class="ml-10 mr-10">
    <el-row>
      <el-table @selection-change="handleSelectionChange" v-shortkey="{right:['arrowright'],left:['arrowleft']}" @shortkey="handleArrow"  @sort-change="tableSort"  class="none-box" :data="filterTableData.slice((pageCurrent - 1) * pageSize, pageCurrent * pageSize)">
        <el-table-column type="selection"  ></el-table-column>

        <el-table-column   sortable="custom" prop="id" :label="t('common.id')" width="80"/>
        <el-table-column  sortable="custom" :show-overflow-tooltip="true" prop="name" :label="t('common.name')"  width="180" >
          <template #default="scope">
            <el-input  sortable="custom" ref="focusRef" v-if="scope.$index === tableEditIndex && 'name'===tableEditFieldName"
                       v-model="tableRowInput" @keyup.enter.native="$event.target.blur()"
                       @blur="handleExitEditMode(scope.$index,scope.row)">

            </el-input>

            <p v-else class="text-ellipsis" @click="handleIntoEditMode(scope.$index,scope.row,'name')">{{ scope.row.name===null? '-':scope.row.name }}</p>
          </template>
        </el-table-column>

        <el-table-column  sortable="custom" prop="syncType" :label="t('common.sync-type')" width="180">
          <template #default="scope">
            <el-select
                @change="updateSyncConfigAndRefresh(scope.row)"
                v-model="scope.row.syncType"
                placeholder="Select"
                size="small"
            >
              <el-option
                  v-for="item in syncTypeOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
              />
            </el-select>
          </template>
        </el-table-column>

        <el-table-column sortable="custom" :show-overflow-tooltip="true"  prop="namespace" :label="t('common.namespace')" >
          <template #default="scope">
            <el-select
                @change="updateSyncConfigAndRefresh(scope.row)"
                default-first-option
                filterable
                allow-create
                v-model="scope.row.namespace"
                placeholder="Select"
                size="small"
            >
              <el-option
                  v-for="item in namespaceOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
              />
            </el-select>
          </template>

        </el-table-column>


        <el-table-column :show-overflow-tooltip="true" prop="Pod" label="pod" >
          <template #default="scope">
            <el-select
                @click="updateNamespacePod(scope.row)"
                @change="updateSyncConfigAndRefresh(scope.row)"
                default-first-option
                filterable
                allow-create
                v-model="scope.row.pod"
                placeholder="Select"
                size="small"
            >
              <el-option
                  v-for="item in namespacePodMap[scope.row.namespace]"
                  :key="item"
                  :label="item"
                  :value="item"
              />
            </el-select>
          </template>

        </el-table-column>

        <el-table-column :show-overflow-tooltip="true" prop="container" label="Container" >
          <template #default="scope">
            <el-select
                @click="updateNamespacePodContainer(scope.row)"
                @change="updateSyncConfigAndRefresh(scope.row)"
                default-first-option
                filterable
                allow-create
                v-model="scope.row.container"
                placeholder="Select"
                size="small"
            >
              <el-option
                  v-for="item in namespacePodContainerMap[scope.row.namespace+'-'+scope.row.pod]"
                  :key="item"
                  :label="item"
                  :value="item"
              />
            </el-select>
          </template>

        </el-table-column>

        <!--    <el-table-column prop="source" label="Source" >-->
        <!--      <template #default="scope">-->
        <!--        <el-input ref="focusRef" v-if="scope.$index === tableEditIndex && 'source'===tableEditFieldName"-->
        <!--                  v-model="tableRowInput" @keyup.enter.native="$event.target.blur()"-->
        <!--                  @blur="handleExitEditMode(scope.$index,scope.row)"></el-input>-->
        <!--        <el-tooltip-->
        <!--            v-else-->
        <!--            effect="light"-->
        <!--            placement="top-start"-->
        <!--        >-->
        <!--          <template #content>{{scope.row.source}}<el-button style="margin-left: 5px" size="small" type="danger" plain @click="handleDeleteResource(scope.$index,scope.row,'source')">delete</el-button>-->
        <!--          </template>-->
        <!--          <p class="text-ellipsis" @click="handleIntoEditMode(scope.$index,scope.row,'source')">{{ scope.row.source }}</p>-->
        <!--        </el-tooltip>-->
        <!--      </template>-->
        <!--    </el-table-column>-->

        <!--    <el-table-column prop="target" label="Target" width="140">-->
        <!--      <template #default="scope">-->
        <!--        <el-input ref="focusRef" v-if="scope.$index === tableEditIndex && 'target'===tableEditFieldName"-->
        <!--                  v-model="tableRowInput" @keyup.enter.native="$event.target.blur()"-->
        <!--                  @blur="handleExitEditMode(scope.$index,scope.row)"></el-input>-->
        <!--        <el-tooltip-->
        <!--            v-else-->
        <!--            effect="light"-->
        <!--            placement="top-start"-->
        <!--        >-->
        <!--          <template #content>{{scope.row.target}}<el-button style="margin-left: 5px" size="small" type="danger" plain @click="handleDeleteResource(scope.$index,scope.row,'target')">delete</el-button>-->
        <!--          </template>-->
        <!--          <p class="text-ellipsis" @click="handleIntoEditMode(scope.$index,scope.row,'target')">{{ scope.row.target }}</p>-->
        <!--        </el-tooltip>-->

        <!--      </template>-->
        <!--    </el-table-column>-->
        <!--    TODO support auto sync-->
        <!--    <el-table-column prop="autoSync" label="AutoSync" width="100">-->
        <!--      <template #default="scope">-->
        <!--        <el-switch @change="updateSyncConfigAndRefresh(scope.row.id,scope.row)" v-model="scope.row.autoSync"/>-->
        <!--      </template>-->
        <!--    </el-table-column>-->

        <el-table-column prop="enable" label="Enable" width="100">
          <template #default="scope">
            <el-switch @change="updateSyncConfigAndRefresh(scope.row)" v-model="scope.row.enable"/>
          </template>
        </el-table-column>

        <el-table-column  fixed="right" width="220" >
          <template #header>
            <el-input v-model="search" size="small" :placeholder="t('common.search-tip')" />
          </template>
          <template #default="scope">
            <el-button size="small" type="success" plain @click="handleSync(scope.row)">{{ t('common.sync') }}</el-button>
            <el-button size="small" type="primary" plain @click="handleEdit(scope.row)">{{ t('common.edit') }}</el-button>
            <el-button size="small" type="danger" plain @click="handleDelete(scope.row)">{{ t('common.delete') }}</el-button>

          </template>
        </el-table-column>
      </el-table>
    </el-row>

    <el-row class="mt-10">
      <el-button style="width: 100%" @click="handleAddItem">{{ t('common.add-item') }}</el-button>
    </el-row>

    <el-row  class="mt-10" justify="end">
      <el-button-group>
        <el-button @click="handleImport" text class="mr-10" type="primary" :icon="Upload">{{ t('common.import') }}</el-button>
        <el-button @click="handleExport" text type="primary" :icon="Download">{{ t('common.export') }}</el-button>
      </el-button-group>
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
      v-model="editMode"
      :title="t('sync-page.edit-sync-title')"
      width="80vw"
      style="max-width: 1000px"
  >
    <el-form class="none-box" :model="editRowInfo" label-width="auto" style="max-width: 1000px"  >
      <el-row>
        <el-col :span="8">
          <el-form-item  :label="t('common.id')">
            <el-input readonly v-model="editRowInfo.id" />
          </el-form-item>
        </el-col>
        <el-col :span="16">
          <el-form-item :label="t('common.enable')">
            <el-switch  v-model="editRowInfo.enable"/>
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item :label="t('common.name')">
        <el-input v-model="editRowInfo.name" />
      </el-form-item>


      <el-form-item :label="t('common.sync-type')"  >
        <template #default="scope">
          <el-select
              v-model="editRowInfo.syncType"
              placeholder="Select"
          >
            <el-option
                v-for="item in syncTypeOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
            />
          </el-select>
        </template>
      </el-form-item>

      <el-form-item :label="t('common.namespace')"  >
        <el-select
            v-model="editRowInfo.namespace"
            default-first-option
            clearable
            filterable
            allow-create
            placeholder="Select"
        >
          <el-option
              v-for="item in namespaceOptions"
              :key="item.value"
              :label="item.value"
              :value="item.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item :label="t('common.pod')">
        <el-select
            @click="updateNamespacePod(editRowInfo)"
            default-first-option
            filterable
            allow-create
            v-model="editRowInfo.pod"
            placeholder="Select"
        >
          <el-option
              v-for="item in namespacePodMap[editRowInfo.namespace]"
              :key="item"
              :label="item"
              :value="item"
          />
        </el-select>
      </el-form-item>

      <el-form-item :label="t('common.container')">
        <el-select
            @click="updateNamespacePodContainer(editRowInfo)"
            default-first-option
            filterable
            allow-create
            v-model="editRowInfo.container"
            placeholder="Select"
            clearable
        >
          <el-option
              v-for="item in namespacePodContainerMap[editRowInfo.namespace+'-'+editRowInfo.pod]"
              :key="item"
              :label="item"
              :value="item"
          />
        </el-select>
      </el-form-item>

      <el-form-item :label="t('common.source-file')">
        <el-input v-model="editRowInfo.source" type="textarea" :autosize="{ minRows: 2, maxRows: 26 }" />
      </el-form-item>

      <el-form-item :label="t('common.target-file')">
        <el-input v-model="editRowInfo.target" type="textarea" :autosize="{ minRows: 2, maxRows: 26 }" />
      </el-form-item>

    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button text @click="editMode = false;refreshSyncList()">{{ t('common.cancel') }}</el-button>
        <el-button text @click="handleSave(editRowInfo)" type="success">{{ t('common.save') }}</el-button>
        <el-button text @click="handleSync(editRowInfo)" type="success">{{ t('common.sync') }}</el-button>
        <el-button text @click="handleDelete(editRowInfo);editMode=false" type="danger" >{{ t('common.delete') }}</el-button>

      </div>
    </template>
  </el-dialog>

  <import-dialog v-model="importDialogShow"  @import-success="refreshSyncList"></import-dialog>
  <share-dialog v-model="exportDialogShow" :exportData="exportData" title="Sync Config"></share-dialog>
</template>

<script setup>
import {onMounted, ref} from "vue"
import {
  apiDeleteResource,
  apiSyncConfigAdd,
  apiSyncConfigDelete,
  apiSyncConfigList,
  apiSyncConfigUpdate,
  apiSyncOnly,
  apiSyncTypeList
} from "@/services/syncConfig.js"
import {apiNamespaceList, apiPodContainerList, apiPodList} from "@/services/namespace.js";
import {Download, Upload} from "@element-plus/icons-vue";
import {apiClusterConfigExport, apiSyncConfigExport} from "@/services/share.js";
import { useI18n } from 'vue-i18n'
const { t } = useI18n()

const item = {
  id: 1,
  name: 'name',
  syncType: 'FILE_LOCAL_TO_POD',
  namespace: 'default',
  pod: 'pod',
  container: 'container',
  source: '/home/test.txt',
  target: '/home/test.txt',
  autoSync: true,
  enable: true
}
const tableData = ref(Array.from({length: 1}).fill(item))
const filterTableData = computed(() => {
  const filterData = tableData.value.filter(item =>{
    if(search.value === ''){
      return true
    }
    if(item.name && item.name.includes(search.value)){
      return true
    }
    if(item.source && item.source.includes(search.value)){
      return true
    }
    if(item.target && item.target.includes(search.value)){
      return true
    }
  })
  return filterData
})

const tableEditIndex = ref(undefined);
const tableEditFieldName = ref(undefined);
const tableRowInput = ref(undefined);
const focusRef = ref(null);
const editMode = ref(false)
const editRowInfo = ref(undefined)

const pageSize = ref(10)
const pageCurrent = ref(1)

const search = ref('')

const tableMultipleSelection = ref()

const exportDialogShow = ref(false)
const exportData = ref('')

const importDialogShow = ref(false)



const syncTypeSelectValue = ref('')

const syncTypeOptions = ref([{
  value: 'Option1',
  label: 'Option1',
}])

const namespaceOptions = ref([{
  value: 'default',
  label: 'default',
}])

const namespacePodMap = ref({
  namespace1: ['pod1','pod2']
})

const namespacePodContainerMap = ref({
  "namespace1-pod1": ['container1','container2']
})


const tableSort = (sortInfo) => {

  let sortField = sortInfo.prop
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

const refreshSyncTypeOptions = () => {
  apiSyncTypeList().then(async res => {
    const resData = await res.json()
    syncTypeOptions.value = resData.map(item => {
      return {
        value: item,
        label: item
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

const refreshSyncList = () => {
  apiSyncConfigList().then(async res => {
    const resData = await res.json()
    tableData.value = resData
  }).catch(err => {
    ElMessage({
      message: "request error: " + err,
      type: 'error'
    })
    console.log(err)
  })
}


const handleEdit = (syncConfig) => {
  editRowInfo.value = syncConfig
  editMode.value = true
}

const handleSave = (syncConfig) => {

  apiSyncConfigUpdate(syncConfig.id, syncConfig).then(res => {
    const status = res.status
    if (status === 200) {
      ElMessage({
        message: `update config success`,
        type: 'success'
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

onMounted(() => {
  refreshSyncTypeOptions()
  refreshSyncList()
  refreshNamespaceOptions()
})

const handleSync = (syncConfig) => {
  apiSyncOnly(syncConfig.id).then(async res => {
    const status = res.status
    if (status === 200) {
      const resJson = await res.json()
      ElMessage({
        message: `sync task ${syncConfig.id} ${resJson.success},cost ${resJson.spendMillisecond} ms`,
        type: 'success'
      })
    } else {
      const resText = await res.text()
      ElMessage({
        message: `${resText}`,
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

const updateSyncConfigAndRefresh = async (row) => {
  await apiSyncConfigUpdate(row.id, row).then(res => {
    const status = res.status
    if (status === 200) {
      ElMessage({
        message: `update config success`,
        type: 'success'
      })
    }
  }).catch(err => {
    ElMessage({
      message: "request error: " + err,
      type: 'error'
    })
    console.log(err)
  })
  refreshSyncList()
}

const updateNamespacePod = async (row) => {
  await apiPodList(row.namespace).then(async res => {
    const status = res.status
    const resJson = await res.json()
    if (status === 200) {
      namespacePodMap.value[row.namespace] = resJson
    }
  }).catch(err => {
    ElMessage({
      message: "request error: " + err,
      type: 'error'
    })
    console.log(err)
  })
}
const updateNamespacePodContainer = async (row) => {
  await apiPodContainerList(row.namespace,row.pod).then(async res => {
    const status = res.status
    const resJson = await res.json()
    if (status === 200) {
      namespacePodContainerMap.value[row.namespace+"-"+row.pod] = resJson
    }
  }).catch(err => {
    ElMessage({
      message: "request error: " + err,
      type: 'error'
    })
    console.log(err)
  })
}


const handleDelete = async (syncConfig) => {
  await apiSyncConfigDelete(syncConfig.id).then(async res => {
    const status = res.status
    if (status === 200) {
      ElMessage({
        message: `delete sync config success`,
        type: 'success'
      })
    }
  }).catch(err => {
    ElMessage({
      message: "request error: " + err,
      type: 'error'
    })
    console.log(err)
  })
  refreshSyncList()

}

const handleAddItem = async () => {
  await apiSyncConfigAdd("FILE_LOCAL_TO_POD", false, false, "default", "pod", "container", "/home/source.txt", "/home/tartget.txt").then(async res => {
    const status = res.status
    if (status === 200) {
      ElMessage({
        message: `add sync config success`,
        type: 'success'
      })
    }

  }).catch(err => {
    ElMessage({
      message: "request error: " + err,
      type: 'error'
    })
    console.log(err)
  })

  refreshSyncList()
}


const handleIntoEditMode = (index, row, propName) => {
  tableEditIndex.value = index
  tableEditFieldName.value = propName
  setTimeout(() => {
    focusRef.value.focus()
  }, 10)

  tableRowInput.value = row[propName]
}

const handleExitEditMode = async (index, row) => {
  tableEditIndex.value = -1
  row[tableEditFieldName.value] = tableRowInput.value

  await apiSyncConfigUpdate(row.id, row).then(async res => {
    const status = res.status
    if (status === 200) {
      ElMessage({
        message: `update sync config success`,
        type: 'success'
      })
    }
  }).catch(err => {
    ElMessage({
      message: "request error: " + err,
      type: 'error'
    })
    console.log(err)
  })

  refreshSyncList()
}

const handleDeleteResource = (index, row, type) => {
  apiDeleteResource(row.id, type).then(res => {
    const status = res.status
    if (status === 200) {
      ElMessage({
        message: `delete file or folder success`,
        type: 'success'
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

const handleExport = () => {
  let exportIds
  if(tableMultipleSelection.value){
    exportIds = tableMultipleSelection.value.map(item => item.id)
  }
  apiSyncConfigExport(exportIds).then(async res => {
    const resData = await res.json()
    exportData.value = JSON.stringify(resData,null,2)
    exportDialogShow.value = true

  }).catch(err => {
    ElMessage({
      message: "request error: " + err,
      type: 'error'
    })
    console.log(err)
  })
}

const handleImport = ()=>{
  importDialogShow.value = true
}

const handleSelectionChange = (selection) => {
  tableMultipleSelection.value = selection
}

</script>

<style lang="scss" scoped>
.text-ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}



</style>