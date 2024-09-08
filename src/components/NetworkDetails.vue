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
<!--        <el-button style="margin-left: 10px;" round plain link @click="() => {isAutoRefresh = !isAutoRefresh;refreshData()}">-->
<!--          <el-icon size="18px" :class="{'is-loading':isAutoRefresh}" >-->
<!--            <Refresh />-->
<!--          </el-icon>-->
<!--        </el-button >-->
      </el-tooltip>

    </el-row>

    <div v-if="selectedOption==='Info'">
      <el-row>

        <el-descriptions v-loading="baseInfoLoading"
                         class="margin-top"
                         :title="t('app-details-page.base-info')"
                         :column="3"
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
            {{ serviceInfo.namespace }}
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
            {{ serviceInfo.name }}
          </el-descriptions-item>

          <el-descriptions-item>
            <template #label>
              <div class="cell-item">
                <el-icon :style="iconStyle">
                  <Document />
                </el-icon>
                {{ t('common.type') }}
              </div>
            </template>
            {{ serviceInfo.type }}
          </el-descriptions-item>


          <el-descriptions-item>
            <template #label>
              <div class="cell-item">
                <el-icon :style="iconStyle">
                  <Document />
                </el-icon>
                {{ t('common.cluster-ip') }}
              </div>
            </template>
            {{ serviceInfo.clusterIP }}
          </el-descriptions-item>


          <el-descriptions-item>
            <template #label>
              <div class="cell-item">
                <el-icon :style="iconStyle">
                  <Calendar />
                </el-icon>
                {{ t('common.create-time') }}

              </div>
            </template>
            {{ formattedDate(serviceInfo.createdTime) }}
          </el-descriptions-item>
        </el-descriptions>



      </el-row>
<!--      <el-row>-->
<!--        <el-text class="el-descriptions__title">Pods</el-text>-->
<!--      </el-row>-->
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

</template>

<script setup>
import {useI18n} from "vue-i18n";
import {ref} from "vue";
import {formattedDate} from "../services/common.js";
import {Codemirror} from "vue-codemirror";
import {yaml} from "@codemirror/lang-yaml";

import {oneDark} from "@codemirror/theme-one-dark";
import {useDark} from "@vueuse/core";
import {useRoute} from "vue-router";
import {apiServiceGet, apiServiceYamlGet, apiServiceYamlUpdate} from "@/services/service.js";
import {apiDeploymentYamlGet, apiDeploymentYamlUpdate} from "@/services/deployment.js";
import {apiStatefulsetYamlGet} from "@/services/statefulset.js";
import {apiDaemonsetYamlGet} from "@/services/daemonset.js";
import {apiJobYamlGet} from "@/services/job.js";

const { t } = useI18n()
const size = ref('large')
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
const selectedOption = ref('Info')
const options = ['Info','Yaml']
const isAutoRefresh = ref(false)
const baseInfoLoading = ref(true)
const tableServiceLoading = ref(true)
const yamlLoading = ref(true)
const yamlCode = ref('')
const yamlCodeRaw = ref('')
const route = useRoute()


const dialogVisible = ref(false)
const dialogTitle = ref('')
const dialogMessage = ref('')
const dialogConfirmFuction = ref(() => {dialogVisible.value = false})
const dialogConfirmFuctionLast = ref(()=>{dialogVisible.value = false;dialogConfirmFuction.value()})


const isDark = useDark({
  storageKey: 'vue-theme-mode',
  valueDark: 'dark',
  valueLight: 'light',
})


onMounted(() => {
  refreshData()
})

const refreshData = () => {
  updateServiceInfo()
  updateNetworkYaml()
}

const serviceInfoRaw = ref(null)
const serviceInfo = computed(()=>{
  if(!serviceInfoRaw.value){
    return {}
  }
  return {
    'namespace': serviceInfoRaw.value.metadata.namespace,
    'name': serviceInfoRaw.value.metadata.name,
    'type': serviceInfoRaw.value.spec.type,
    'clusterIP': serviceInfoRaw.value.spec.clusterIP,
    'createdTime': formattedDate(serviceInfoRaw.value.metadata.creationTimestamp),
  }
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



const handleCancelSaveYaml = () => {
  yamlCode.value = yamlCodeRaw.value
}

const saveAppYaml = () => {
  apiServiceYamlUpdate(route.params.namespace,route.params.service,yamlCode.value).then(async res => {

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


const updateServiceInfo = async () => {
  baseInfoLoading.value = true
  let wait = apiServiceGet(route.params.namespace, route.params.service).then(async res => {
    const resData = await res.json()
    serviceInfoRaw.value = resData

  }).catch(err => {
    ElMessage({
      message: "request error: " + err,
      type: 'error'
    })
    console.log(err)
  })

  await wait
  baseInfoLoading.value = false
}

const updateNetworkYaml = async () => {
  yamlLoading.value = true

  let wait = apiServiceYamlGet(route.params.namespace, route.params.service).then(async res => {
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

  await wait
  yamlLoading.value = false
}


</script>

<style scoped>

</style>