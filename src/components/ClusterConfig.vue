<template >
    <el-table  v-shortkey="{right:['arrowright'],left:['arrowleft']}" @shortkey="handleArrow"  @sort-change="tableSort" :data="filterTableData.slice((pageCurrent - 1) * pageSize, pageCurrent * pageSize)" class="common-margin none-box">
      <el-table-column sortable="custom" prop="id" label="Id" width="80" />s

      <el-table-column sortable="custom" prop="name" label="Name" width="200">
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



      <el-table-column >
        <template #header>
          <el-row>
            <el-input v-model="search" size="small" :prefix-icon="Search" placeholder="Search name or config" />


          </el-row>

        </template>
        <template #default="scope">
            <el-button size="small" type="default" plain @click="handleConnect(scope.row)">connect</el-button>
            <el-button size="small" type="primary"  plain @click="handleEdit(scope.row)">edit</el-button>
          <el-button size="small" type="success" plain @click="handleActive(scope.row)">active</el-button>

        </template>
      </el-table-column>
    </el-table>

    <el-button class="mt-4 common-margin"  @click="handleAddItem">Add Item</el-button>
    <el-row justify="end">
      <el-pagination
          v-model:current-page="pageCurrent"
          v-model:page-size="pageSize"
          :page-sizes="[5, 10, 20, 50]"
          layout="total,sizes, prev, pager, next"
          :total="filterTableData.length"

      />
    </el-row>


  <el-dialog
      class="none-box"
      v-model="editMode"
      title="Cluster Config"
      width="80vw"
  >
    <el-form :model="editRowInfo" label-width="auto" style="max-width: 78vw">
      <el-form-item label="id">
        <el-input readonly v-model="editRowInfo.id" />
      </el-form-item>
      <el-form-item label="Name">
        <el-input v-model="editRowInfo.name" />
      </el-form-item>
      <el-form-item label="content"  >
        <el-input v-model="editRowInfo.config" autosize type="textarea" />
      </el-form-item>

    </el-form>
    <template #footer>
      <div class="dialog-footer">
          <el-button  text @click="editMode = false">Cancel</el-button>

          <el-button-group style="margin-left: 20px">
            <el-button  text @click="handleSave(editRowInfo)" type="success">Save</el-button>
            <el-button  text @click="handleConnect(editRowInfo)"  type="success" >Connect</el-button>
            <el-button  text @Click="handleActive(editRowInfo)" type="success">Active</el-button>
          </el-button-group>

          <el-button style="margin-left: 20px" text @click="handleDelete(editRowInfo);editMode=false" type="danger" >Delete</el-button>

      </div>
    </template>
  </el-dialog>


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
import {Search} from "@element-plus/icons-vue";

  
const item = {
    id: 1,
    name: 'remote-k8s',
    config: 'config...\naaa\nbbb\nccc'
}
const tableData = ref(Array.from({ length: 0 }).fill(item))
const filterTableData = computed(() => {
  const filterData = tableData.value.filter(item =>{
    if(search.value === ''){
      return true
    }
    if(item.name && item.name.includes(search.value)){
      return true
    }
    if(item.config && item.config.includes(search.value)){
      return true
    }

  })
  return filterData
})

const tableEditIndex = ref(undefined);
const tableEditFieldName = ref(undefined);
const tableRowInput = ref(undefined);
const focusRef = ref(null);

const clusterInfo = useClusterInfo()

const pageSize = ref(10)
const pageCurrent = ref(1)
const search = ref('')

const editMode = ref(false)
const editRowInfo = ref({
  id: 0,
  name: '',
  config: ''
})


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

onMounted(() => {

  updateClusterConfig()
})

const handleConnect = (config) => {
  apiClusterConnect(config.id).then(async res => {
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


const handleActive = (config) => {
  apiClusterActive(config.id).then(async res => {
    const status = res.status
    if(status === 200){
      clusterInfo.activeId = config.id
      clusterInfo.activeName = config.name

      ElMessage({
        message:`active config id [${config.id}] success`,
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

const handleEdit = (row) => {
  editRowInfo.value = row
  editMode.value = true
}

const handleDelete = async (config) => {
  await apiClusterDelete(config.id).then(async res => {
    const status = res.status
    if (status === 200) {
      ElMessage({
        message: `delete config id [${config.id}] success`,
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
  tableEditIndex.value = index
  tableEditFieldName.value=propName
  setTimeout(() => {
    focusRef.value.focus()
  }, 10)

  tableRowInput.value = row[propName]
}

const handleExitEditMode = async (index,row) => {
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

const handleSave = async (config) => {
  await apiClusterUpdate(config.id,config).then(async res => {
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