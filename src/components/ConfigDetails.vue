<template>
  <div  class="custom-style" style="margin-left: 10px;">
    <el-row align="top">
      <el-segmented size="large"  v-model="selectedOption" :options="options" >
        <template #default="scope">
          <div style="padding: 0px 20px 0px 20px;">
            <el-text tag="b">{{ scope.item }}</el-text>
          </div>
        </template>
      </el-segmented>


      <el-tooltip  placement="top-start" effect="light" content="Refresh data every 10s">
        <el-button style="margin-left: 10px;" round plain link @click="() => {isAutoRefresh = !isAutoRefresh;refreshData()}">
          <el-icon size="18px" :class="{'is-loading':isAutoRefresh}" >
            <Refresh />
          </el-icon>
        </el-button >
      </el-tooltip>

    </el-row>

    <div v-if="selectedOption==='Info'">
      <el-row>

        <el-descriptions v-loading="baseInfoLoading"
                         class="margin-top"
                         :title="t('config-detail-page.base-info')"
                         :column="2"
                         :size="size"
                         border
        >
          <template #extra>

          </template>
          <el-descriptions-item>
            <template #label>
              <div class="cell-item">
                <el-icon :style="iconStyle">
                  <House />
                </el-icon>
                {{ t('common.namespace') }}
              </div>
            </template>
            {{ configInfo.namespace }}
          </el-descriptions-item>
          <el-descriptions-item>
            <template #label>
              <div class="cell-item">
                <el-icon :style="iconStyle">
                  <Document />
                </el-icon>
                {{ t('common.name') }}
              </div>
            </template>
            {{ configInfo.name }}
          </el-descriptions-item>
          <el-descriptions-item>
            <template #label>
              <div class="cell-item">
                <el-icon :style="iconStyle">
                  <PieChart />
                </el-icon>
                {{ t('common.kind') }}
              </div>
            </template>
            {{ configInfo.kind }}
          </el-descriptions-item>


          <el-descriptions-item>
            <template #label>
              <div class="cell-item">
                <el-icon :style="iconStyle">
                  <Calendar />
                </el-icon>
                {{ t('common.created-time') }}
              </div>
            </template>
            {{ formattedDate(configInfo.createdTime) }}
          </el-descriptions-item>
        </el-descriptions>



      </el-row>
      <el-row>
        <el-text class="el-descriptions__title">{{ t('common.data') }}</el-text>
      </el-row>
      <el-row>
        <el-table style="margin-top: 10px" :data="tableConfigData" v-loading="tableDatasLoading">

          <el-table-column sortable prop="name" :label="t('common.name')" width="240">
            <template #default="scope">
                {{ scope.row.name }}
            </template>
          </el-table-column>


          <el-table-column sortable prop="data" :label="t('common.data')" >
            <template #default="scope">
              <el-text style="width: 100%" :line-clamp="2" >
                {{ route.params.configType === 'ConfigMap'? scope.row.data: '' }}
                {{ route.params.configType === 'Secret'? base64Decode(scope.row.data): '' }}

              </el-text>
            </template>
          </el-table-column>

          <el-table-column  :label="t('common.operation')" width="280">
            <template #default="scope">
              <el-button size="small" type="success"
                         plain @click="handleEditData(scope.row)">{{ t('common.edit') }}
              </el-button>


              <el-button size="small" type="danger" plain @click="handleDeleteConfigData(scope.row)">{{ t('common.delete') }}
              </el-button>

            </template>
          </el-table-column>


        </el-table>
        <el-button class="mt-4 common-margin"  style="width: 100%;margin-top: 10px" @click="handleAddItemData">{{ t('common.add-item') }}</el-button>

      </el-row>

    </div>
    <div v-if="selectedOption==='Yaml'">

      <el-scrollbar v-loading="yamlLoading" max-height="65vh"  style="max-width:70vw;margin-top: 10px">

        <codemirror

            v-model="yamlCode"
            placeholder="Code goes here..."
            :autofocus="true"
            :indent-with-tab="true"
            :tab-size="2"
            :extensions="codeExtensions"
        />
      </el-scrollbar>
      <el-row style="max-width: 70vw" class="row-bg" justify="end">
        <el-button size="default" type="info" plain @click="handleCancelSaveYaml">{{ t('common.cancel') }}</el-button>
        <el-button size="default" type="success" plain @click="saveAppYaml">{{ t('common.save') }}</el-button>
      </el-row>



    </div>



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

  <el-dialog
      class="none-box"
      v-model="editMode"
      :title="t('common.data')"
      width="80vw"
  >
    <el-form :model="configRaw" label-width="auto" style="max-width: 78vw">

      <el-form-item label="Key">
        <el-input readonly v-model="editRowName" />
      </el-form-item>
      <el-form-item label="Value"  >
        <el-input v-model="editRowDecodedText" :autosize="{ minRows: 2, maxRows: 26 }" type="textarea" />
      </el-form-item>

    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button  text @click="editMode = false;refreshData()">{{ t('common.cancel') }}</el-button>

        <el-button-group style="margin-left: 20px">
          <el-button  text @click="handleSaveData" type="success">{{ t('common.save') }}</el-button>
        </el-button-group>

<!--        <el-button style="margin-left: 20px" text @click="handleDelete(editRowInfo);editMode=false" type="danger" >Delete</el-button>-->

      </div>
    </template>
  </el-dialog>

</template>
<script  setup>
import {ref} from 'vue'
import {useRoute} from 'vue-router'

import {Refresh} from '@element-plus/icons-vue'
import {Codemirror} from "vue-codemirror";
import {yaml} from "@codemirror/lang-yaml";

import {oneDark} from "@codemirror/theme-one-dark";
import {useDark} from "@vueuse/core";
import {formattedDate} from "../services/common.js";
import {
  apiConfigmapGet,
  apiConfigmapUpdate,
  apiConfigmapYamlGet,
  apiConfigmapYamlUpdate
} from "@/services/configmap.js";
import {apiSecretGet, apiSecretUpdate, apiSecretYamlGet, apiSecretYamlUpdate} from "@/services/secret.js";
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
const selectedOption = ref('Info')

// const options = ['Info','Env','Metadata','Event' ]
const options = ['Info','Yaml' ]
const tableDatasLoading = ref(true)
const baseInfoLoading = ref(true)
const yamlLoading = ref(true)
const isAutoRefresh = ref(false)
const size = ref('large')
const yamlCode = ref('')
const yamlCodeRaw = ref('')
const route = useRoute()

const dialogVisible = ref(false)
const dialogTitle = ref('')
const dialogMessage = ref('')
const dialogConfirmFuction = ref(() => {dialogVisible.value = false})
const dialogConfirmFuctionLast = ref(()=>{dialogVisible.value = false;dialogConfirmFuction.value()})

const item = {}
const configRaw = ref({})
const configInfo = ref({})
const tableConfigData = ref(Array.from({ length: 1 }).fill(item))

const editMode = ref(false)
const editRowName = ref('')

const editRowEncodedText = ref('')
const editRowDecodedText = ref('')
watch(()=>[editRowName,configRaw],(oldValue,newValue)=>{
  if(!editRowName.value ){
    return
  }
  if(route.params.configType === 'ConfigMap'){
    editRowDecodedText.value = configRaw.value.data[editRowName.value]
  }else if(route.params.configType === 'Secret'){
    editRowDecodedText.value = base64Decode(configRaw.value.data[editRowName.value])
  }
},{deep:true})

watch(editRowDecodedText,() => {
  if(!editRowDecodedText.value){
    return
  }
  if(route.params.configType === 'ConfigMap'){
    editRowEncodedText.value = editRowDecodedText.value
  }else if(route.params.configType === 'Secret'){
    editRowEncodedText.value = btoa(editRowDecodedText.value)
  }
  configRaw.value.data[editRowName.value] = editRowEncodedText.value
},{deep:true})


const isDark = useDark({
  storageKey: 'vue-theme-mode',
  valueDark: 'dark',
  valueLight: 'light',
})

const codeExtensions = ref([
  yaml(),
  oneDark,
])
watch(isDark, (isDarkValue) => {
  if(isDarkValue){
    codeExtensions.value = [
      yaml(),
      oneDark,
    ]
  }else{
    codeExtensions.value = [
      yaml(),
    ]
  }
})

const iconStyle = computed(() => {
  const marginMap = {
    large: '8px',
    default: '6px',
    small: '4px',
  }
  return {
    marginRight: marginMap[size.value] || marginMap.default,
  }
})






// update base info
watch(
    configRaw,
    () => {
      if(!configRaw.value){
        configInfo.value = {}
        return
      }

      let config = {}
      if(route.params.configType === 'ConfigMap'){
        config = {
          namespace: configRaw.value.metadata.namespace,
          name: configRaw.value.metadata.name,
          createdTime: configRaw.value.metadata.creationTimestamp,
          kind: configRaw.value.kind
        }
      }else if(route.params.configType === 'Secret'){
        config = {
          namespace: configRaw.value.metadata.namespace,
          name: configRaw.value.metadata.name,
          createdTime: configRaw.value.metadata.creationTimestamp,
          kind: configRaw.value.kind
        }
      }

      configInfo.value = config

    },
    {
     deep: true
    }
)

// update data
watch(
    configRaw,
    () => {
      tableDatasLoading.value = true
      if(!configRaw.value){
        tableConfigData.value = []
        return
      }

      let config = []
      if(route.params.configType === 'ConfigMap'){
        for(const key in configRaw.value.data){
          if(configRaw.value.data.hasOwnProperty(key)){
            const value = configRaw.value.data[key]
            config.push({
              name: key,
              data: value
            })
          }
        }
      }else if(route.params.configType === 'Secret'){
        for(const key in configRaw.value.data){
          if(configRaw.value.data.hasOwnProperty(key)){
            const value = configRaw.value.data[key]
            config.push({
              name: key,
              data: value
            })
          }
        }
      }
      tableConfigData.value = config
      tableDatasLoading.value = false
    },
    {
      deep: true
    }
)





const updateConfigInfo = async () => {
  baseInfoLoading.value = true
  let wait
  if (route.params.configType === 'ConfigMap') {
    wait = apiConfigmapGet(route.params.namespace, route.params.configName).then(async res => {
      const resData = await res.json()
      configRaw.value = resData

    }).catch(err => {
      ElMessage({
        message: "request error: " + err,
        type: 'error'
      })
      console.log(err)
    })
  }else if (route.params.configType === 'Secret') {
    wait = apiSecretGet(route.params.namespace, route.params.configName).then(async res => {
      const resData = await res.json()
      configRaw.value = resData

    }).catch(err => {
      ElMessage({
        message: "request error: " + err,
        type: 'error'
      })
      console.log(err)
    })
  }
  await wait
  baseInfoLoading.value = false
}






const updateAppYaml = async () => {
  yamlLoading.value = true
  let wait
  if (route.params.configType === 'ConfigMap') {
    wait = apiConfigmapYamlGet(route.params.namespace, route.params.configName).then(async res => {
      const resData = await res.text()
      yamlCode.value = resData
      yamlCodeRaw.value = resData
    }).catch(err => {
      ElMessage({
        message: "request error: " + err,
        type: 'error'
      })
      console.log(err)
    })
  }else if (route.params.configType === 'Secret') {
    wait = apiSecretYamlGet(route.params.namespace, route.params.configName).then(async res => {
      const resData = await res.text()
      yamlCode.value = resData
      yamlCodeRaw.value = resData
    }).catch(err => {
      ElMessage({
        message: "request error: " + err,
        type: 'error'
      })
      console.log(err)
    })
  }
  await wait
  yamlLoading.value = false
}

const saveAppYaml = () => {
  if(route.params.configType === 'ConfigMap'){
    apiConfigmapYamlUpdate(route.params.namespace,route.params.configName,yamlCode.value).then(async res => {

      if(res.status === 200){
        ElMessage({
          message: "update yaml success",
          type: 'success'
        })
        refreshData()

      }else{
        let errorMessage = await res.text()
        ElMessage({
          message: errorMessage,
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
  }else if(route.params.configType === 'Secret'){
    apiSecretYamlUpdate(route.params.namespace,route.params.configName,yamlCode.value).then(async res => {

      if(res.status === 200){
        ElMessage({
          message: "update yaml success",
          type: 'success'
        })
        refreshData()

      }else{
        let errorMessage = await res.text()
        ElMessage({
          message: errorMessage,
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


}

const handleAddItemData = () =>{
  const len = Object.keys(configRaw.value.data).length

  if(route.params.configType === 'ConfigMap'){
    configRaw.value.data['key-' + len] = 'value-' + len

    apiConfigmapUpdate(route.params.namespace,route.params.configName,configRaw.value).then(async res => {

      if(res.status === 200){
        ElMessage({
          message: "update configmap success",
          type: 'success'
        })
        refreshData()

      }else{
        let errorMessage = await res.text()
        ElMessage({
          message: errorMessage,
          type: 'error'
        })
      }
    })
  }else if(route.params.configType === 'Secret'){
    configRaw.value.data['key-' + len] = btoa('value-' + len)

    apiSecretUpdate(route.params.namespace,route.params.configName,configRaw.value).then(async res => {

      if(res.status === 200){
        ElMessage({
          message: "update secret success",
          type: 'success'
        })
        refreshData()

      }else{
        let errorMessage = await res.text()
        ElMessage({
          message: errorMessage,
          type: 'error'
        })
      }
    })
  }

}

const handleEditData = (row) =>{
  editRowName.value = row.name
  editMode.value = true
}

const handleSaveData = async () => {
  let wait;
  if (route.params.configType === 'ConfigMap') {
    wait = apiConfigmapUpdate(route.params.namespace, route.params.configName, configRaw.value).then(async res => {

      if (res.status === 200) {
        refreshData()
        ElMessage({
          message: "update configmap success",
          type: 'success'
        })


      } else {
        let errorMessage = await res.text()
        ElMessage({
          message: errorMessage,
          type: 'error'
        })
      }
    })
  } else if (route.params.configType === 'Secret') {
    wait = apiSecretUpdate(route.params.namespace, route.params.configName, configRaw.value).then(async res => {

      if (res.status === 200) {
        ElMessage({
          message: "update configmap success",
          type: 'success'
        })
        refreshData()

      } else {
        let errorMessage = await res.text()
        ElMessage({
          message: errorMessage,
          type: 'error'
        })
      }
    })
  }
  await wait
  editMode.value = false

}

const handleCancelSaveYaml = () => {
  yamlCode.value = yamlCodeRaw.value
}

const handleDeleteConfigData = (row) => {
  dialogVisible.value = true
  dialogTitle.value = "Tips"
  dialogMessage.value = `Delete data '${row.name}' `
  dialogConfirmFuction.value = async () => {
    delete configRaw.value.data[row.name]
    await handleSaveData()
    setTimeout(() => {
      refreshData()
    }, 500)

  }
}


const refreshData = () => {
  updateConfigInfo()
  updateAppYaml()
}

const timer =setInterval(() => {
  if(isAutoRefresh.value){
    refreshData()
  }

}, 10000)

onUnmounted(() => {
  clearInterval(timer)
})


onMounted(() => {
  refreshData()
})

const base64Decode = (base64Text) =>{
  if(!base64Text){
    return '-'
  }
  try{
    return atob(base64Text)
  }catch (e){
    console.error("error:",e)
    return e.toString()
  }

}
</script>

<style scoped>
.custom-style .el-segmented {
  /*--el-segmented-item-selected-color: var(--el-text-color-primary);*/
  --el-segmented-item-selected-bg-color: #3987e0;


}
.custom-style .el-row{
  padding-top: 10px;
}



</style>
