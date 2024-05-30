<template>
  
    <el-table :data="tableData" class="common-margin">
      <el-table-column prop="id" label="Id" width="80" />

      <el-table-column prop="name" label="Name" width="200">
        <template #default="scope" >
            <el-input ref="focusRef"  v-if="scope.$index === tableEditIndex && 'name'===tableEditFieldName" v-model="tableRowInput" @keyup.enter.native="$event.target.blur()" @blur="handleExitEditMode(scope.$index,scope.row)"></el-input>
            <p v-else  @click="handleIntoEditMode(scope.$index,scope.row,'name')"  >{{ scope.row.name?scope.row.name:'-' }}</p>
        </template>
      </el-table-column>

        
      <el-table-column prop="config" label="Config" >
        <template #default="scope" >
            <el-input :autosize="{minRows:1,maxRows:3}" resize="none" type="textarea" ref="focusRef"  v-if="scope.$index === tableEditIndex && 'config'===tableEditFieldName" v-model="tableRowInput" @keyup.enter.native="$event.target.blur()" @blur="handleExitEditMode(scope.$index,scope.row)"></el-input>
            <p v-else class="text-ellipsis" @click="handleIntoEditMode(scope.$index,scope.row,'config')"  >{{ scope.row.config?scope.row.config:'-' }}</p>
        </template>
      </el-table-column>

      <!-- <el-table-column prop="status" label="Status" >
        <template #default="scope" >
            <el-input ref="focusRef"  v-if="scope.$index === tableEditIndex && 'status'===tableEditFieldName" v-model="tableRowInput" @blur="handleExitEditMode"></el-input>
            <p v-else  @click="handleIntoEditMode(scope.$index,scope.row,'status')"  >clickToEdit</p>
        </template>
      </el-table-column> -->

      <el-table-column label="Operation">
        <template #default="scope">
            <el-button size="small" type="primary" plain @click="handleConnect(scope.$index,scope.row)">connect</el-button>
            <el-button size="small" type="success" plain @click="handleActive(scope.$index,scope.row)">active</el-button>
            <el-button size="small" type="danger"  plain @click="handleDelete(scope.$index,scope.row)">delete</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-button class="mt-4 common-margin"  @click="handleAddItem">Add Item</el-button>
  </template>
  
<script setup>
import {ref} from "vue"
import {
  apiClusterActive,
  apiClusterAdd,
  apiClusterConnect,
  apiClusterDelete,
  apiClusterList,
  apiClusterUpdate
} from "@/services/clusterConfig.js";
import {useClusterInfo} from "@/store/clusterStore.js";

  
const item = {
    id: 1,
    name: 'remote-k8s',
    config: 'config...\naaa\nbbb\nccc'
}
const tableData = ref(Array.from({ length: 0 }).fill(item))
const tableEditIndex = ref(undefined);
const tableEditFieldName = ref(undefined);
const tableRowInput = ref(undefined);
const focusRef = ref(null);

const clusterInfo = useClusterInfo()

const updateClusterConfig = () => {
  apiClusterList().then(async res => {
    tableData.value = await res.json()
  }).catch(err =>{
    ElMessage({
      message: "request error: " + err,
      type:'error'
    })
    console.log(err)
  })

}

onMounted(() => {

  updateClusterConfig()
})

const handleConnect = (index, row) => {
  apiClusterConnect(row.id).then(async res => {
    const text = await res.json()
    const textB = JSON.stringify(text, null, 2);
    if(res.status === 200){
      ElMessage({
        message: textB,
        type:'success'
      })
    }else{
      ElMessage({
        message: textB,
        type:'error'
      })
    }

  }).catch(err =>{
    ElMessage({
      message: "request error: " + err,
      type:'error'
    })
    console.log(err)
  })

}


const handleActive = (index, row) => {
  apiClusterActive(row.id).then(async res => {
    const status = res.status
    if(status === 200){
      clusterInfo.activeId = row.id
      clusterInfo.activeName = row.name

      ElMessage({
        message:`active config id [${row.id}] success`,
        type:'success'
      })
    }

  }).catch(err =>{
    ElMessage({
      message: "request error: " + err,
      type:'error'
    })
    console.log(err)
  })
}

const handleDelete = async (index, row) => {
  await apiClusterDelete(row.id).then(async res => {
    const status = res.status
    if (status === 200) {
      ElMessage({
        message: `delete config id [${row.id}] success`,
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

  updateClusterConfig()

}

const handleAddItem = async () => {
  await apiClusterAdd("config name", "config can be found in ~/.kube/config").then(async res => {
    const status = res.status
    if (status === 200) {
      ElMessage({
        message: `add config success`,
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

  updateClusterConfig()
}

const handleIntoEditMode = (index, row, propName) => {
  console.log(index, row)
  tableEditIndex.value = index
  tableEditFieldName.value=propName
  setTimeout(() => {
    focusRef.value.focus()
  }, 10)

  tableRowInput.value = row[propName]
}

const handleExitEditMode = async (index,row) => {
  console.log("lost focus")
  tableEditIndex.value = -1
  row[tableEditFieldName.value] = tableRowInput.value

  await apiClusterUpdate(row.id,row).then(async res => {
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

  updateClusterConfig()
}



</script>

<style scoped>

.text-ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.common-margin{
  margin: 0 10px 10px 10px;
  width: calc(100% - 20px);
}
</style>