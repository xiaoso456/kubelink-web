<template>
  
    <el-table :data="tableData">
      <el-table-column prop="id" label="Id" width="40" />

      <el-table-column prop="name" label="Name" >
        <template #default="scope" >
            <el-input ref="focusRef"  v-if="scope.$index === tableEditIndex && 'name'===tableEditFieldName" v-model="tableRowInput" @blur="handleExitEditMode"></el-input>
            <p v-else  @click="handleIntoEditMode(scope.$index,scope.row,'name')"  >{{ scope.row.name }}</p>
        </template>
      </el-table-column>

        
      <el-table-column prop="config" label="Config" >
        <template #default="scope" >
            <el-input ref="focusRef"  v-if="scope.$index === tableEditIndex && 'config'===tableEditFieldName" v-model="tableRowInput" @blur="handleExitEditMode"></el-input>
            <p v-else  @click="handleIntoEditMode(scope.$index,scope.row,'config')"  >{{ scope.row.config }}</p>
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
    <el-button class="mt-4" style="width: 100%" @click="handleAddItem">Add Item</el-button>
  </template>
  
<script setup>
import {ref} from "vue"

  
const item = {
    id: 1,
    name: 'remote-k8s',
    config: 'config...\naaa\nbbb\nccc'
}
const tableData = ref(Array.from({ length: 5 }).fill(item))
const tableEditIndex = ref(undefined);
const tableEditFieldName = ref(undefined);
const tableRowInput = ref(undefined);
const focusRef = ref(null);

const handleConnect = (index, row) => {
  console.log(index, row)
}

const handleActive = (index, row) => {
  console.log(index, row)
}

const handleDelete = (index, row) => {
  // todo use delete api and refresh table data
  console.log(index, row)
  tableData.value.splice(index,1)
}

const handleAddItem = () => {
  // TODO use add api and refresh table data

  tableData.value.push(item)
}

const handleIntoEditMode = (index, row, propName) => {
  console.log(index, row)
  tableEditIndex.value = index
  tableEditFieldName.value=propName
  setTimeout(() => {
    focusRef.value.focus()
  }, 10)

  tableRowInput.value = row[propName]

  // TODO use api to save
}

const handleExitEditMode = () => {
  console.log("lost focus")
  tableEditIndex.value = -1
}

</script>

<style scoped>

</style>