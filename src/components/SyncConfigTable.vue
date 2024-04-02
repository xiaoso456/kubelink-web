<template>
  <el-table :data="tableData">
    <el-table-column prop="id" label="Id" width="60"/>
    <el-table-column prop="syncType" label="SyncType" width="180">
      <template #default="scope">
        <el-select
            @change="updateSyncConfigAndRefresh(scope.row.id,scope.row)"
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

    <el-table-column prop="namespace" label="Namespace" width="120">
      <template #default="scope">
        <el-select
            @change="updateSyncConfigAndRefresh(scope.row.id,scope.row)"
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

    <el-table-column prop="pod" label="Pod" width="120">
      <template #default="scope">
        <el-input ref="focusRef" v-if="scope.$index === tableEditIndex && 'pod'===tableEditFieldName"
                  v-model="tableRowInput" @keyup.enter.native="$event.target.blur()"
                  @blur="handleExitEditMode(scope.$index,scope.row)"></el-input>
        <p v-else @click="handleIntoEditMode(scope.$index,scope.row,'pod')">{{
            scope.row.pod ? scope.row.pod : '-'
          }}</p>
      </template>
    </el-table-column>

    <el-table-column prop="container" label="Container" width="100">
      <template #default="scope">
        <el-input ref="focusRef" v-if="scope.$index === tableEditIndex && 'container'===tableEditFieldName"
                  v-model="tableRowInput" @keyup.enter.native="$event.target.blur()"
                  @blur="handleExitEditMode(scope.$index,scope.row)"></el-input>
        <p v-else @click="handleIntoEditMode(scope.$index,scope.row,'container')">
          {{ scope.row.container ? scope.row.container : '-' }}</p>
      </template>
    </el-table-column>

    <el-table-column prop="source" label="Source">
      <template #default="scope">
        <el-input ref="focusRef" v-if="scope.$index === tableEditIndex && 'source'===tableEditFieldName"
                  v-model="tableRowInput" @keyup.enter.native="$event.target.blur()"
                  @blur="handleExitEditMode(scope.$index,scope.row)"></el-input>
        <p v-else @click="handleIntoEditMode(scope.$index,scope.row,'source')">{{ scope.row.source }}</p>
      </template>
    </el-table-column>

    <el-table-column prop="target" label="Target">
      <template #default="scope">
        <el-input ref="focusRef" v-if="scope.$index === tableEditIndex && 'target'===tableEditFieldName"
                  v-model="tableRowInput" @keyup.enter.native="$event.target.blur()"
                  @blur="handleExitEditMode(scope.$index,scope.row)"></el-input>
        <p v-else @click="handleIntoEditMode(scope.$index,scope.row,'target')">{{ scope.row.target }}</p>
      </template>
    </el-table-column>

    <el-table-column prop="autoSync" label="AutoSync" width="100">
      <template #default="scope">
        <el-switch @change="updateSyncConfigAndRefresh(scope.row.id,scope.row)" v-model="scope.row.autoSync"/>
      </template>
    </el-table-column>

    <el-table-column prop="enable" label="Enable" width="100">
      <template #default="scope">
        <el-switch @change="updateSyncConfigAndRefresh(scope.row.id,scope.row)" v-model="scope.row.enable"/>
      </template>
    </el-table-column>

    <el-table-column label="Opration" width="200">
      <template #default="scope">
        <el-button size="small" type="success" plain @click="handleSync(scope.$index,scope.row)">sync</el-button>
        <el-button size="small" type="danger" plain @click="handleDelete(scope.$index,scope.row)">delete</el-button>
      </template>
    </el-table-column>
  </el-table>
  <el-button class="mt-4" style="width: 100%" @click="handleAddItem">Add Item</el-button>

</template>

<script setup>
import {onMounted, ref} from "vue"
import {
  apiSyncTypeList,
  apiSyncConfigList,
  apiSyncConfigAdd,
  apiSyncConfigDelete,
  apiSyncConfigUpdate,
  apiSyncOnly
} from "@/services/syncConfig.js"
import {apiNamespaceList} from "@/services/namespace.js";

const item = {
  id: 1,
  syncType: 'FILE_LOCAL_TO_POD',
  namespace: 'default',
  pod: 'pod',
  container: 'container',
  source: '/home/test.txt',
  target: '/home/test.txt',
  autoSync: true,
  enable: true
}
const tableData = ref(Array.from({length: 5}).fill(item))
const tableEditIndex = ref(undefined);
const tableEditFieldName = ref(undefined);
const tableRowInput = ref(undefined);
const focusRef = ref(null);

const syncTypeSelectValue = ref('')

const syncTypeOptions = ref([{
  value: 'Option1',
  label: 'Option1',
}])

const namespaceOptions = ref([{
  value: 'default',
  label: 'default',
}])

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
    console.log(resData)
    tableData.value = resData
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

const handleSync = (index, row) => {
  apiSyncOnly(row.id).then(async res => {
    const status = res.status
    const text = await res.text()
    if (status === 200) {
      ElMessage({
        message: `sync task ${row.id} success`,
        type: 'success'
      })
    } else {
      ElMessage({
        message: `${text}`,
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

const updateSyncConfigAndRefresh = async (id, row) => {
  await apiSyncConfigUpdate(id, row).then(res => {
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

const handleDelete = async (index, row) => {
  console.log(index, row)
  await apiSyncConfigDelete(row.id).then(async res => {
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


</script>

<style lang="scss" scoped>


</style>