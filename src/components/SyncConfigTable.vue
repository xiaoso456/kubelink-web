<template>

  <el-table :data="tableData">
    <el-table-column prop="id" label="Id" width="40" />
    <el-table-column prop="syncType" label="SyncType" width="200-0"/>
    <el-table-column prop="namespace" label="Namespace" />
    <el-table-column prop="pod" label="Pod" />
    <el-table-column prop="container" label="Container" />
    <el-table-column prop="source" label="Source" />
    <el-table-column prop="target" label="Target" />
    <el-table-column prop="autoSync" label="AutoSync" />
    <el-table-column prop="enable" label="Enable" />
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
import {ref} from "vue"


const item = {
  id: 1,
  syncType: 'FILE_LOCAL_TO_POD',
  namespace: 'default',
  pod: 'pod',
  container : 'container',
  source: '/home//test.txt',
  target: '/home/test.txt',
  autoSync: true,
  enable: true
}
const tableData = ref(Array.from({ length: 5 }).fill(item))


const handleSync = (index, row) => {
  console.log(index, row)
}

const handleDelete = (index, row) => {
  // todo use delete api and refresh table data
  tableData.value.splice(index,1)
  console.log(index, row)
}

const handleAddItem = () => {
  // TODO use add api and refresh table data
  tableData.value.push(item)
}
</script>

<style scoped>

</style>