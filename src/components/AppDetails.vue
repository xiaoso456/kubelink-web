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
            {{ appInfo.namespace }}
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
            {{ appInfo.name }}
          </el-descriptions-item>
          <el-descriptions-item>
            <template #label>
              <div class="cell-item">
                <el-icon :style="iconStyle">
                  <PieChart />
                </el-icon>
                {{ t('common.replicas') }}
              </div>
            </template>
            {{ appInfo.availableReplicas }}/{{ appInfo.replicas }}
          </el-descriptions-item>
          <el-descriptions-item>
            <template #label>
              <div class="cell-item">
                <el-icon :style="iconStyle">
                  <Ticket />
                </el-icon>
                {{ t('common.restart-policy') }}
              </div>
            </template>
            {{ appInfo.restartPolicy }}
          </el-descriptions-item>
          <el-descriptions-item>
            <template #label>
              <div class="cell-item">
                <el-icon :style="iconStyle">
                  <TrendCharts />
                </el-icon>
                {{ t('common.generation') }}
              </div>
            </template>
            {{ appInfo.generation }}
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
            {{ formattedDate(appInfo.createdTime) }}
          </el-descriptions-item>
        </el-descriptions>



      </el-row>
      <el-row>
          <el-text class="el-descriptions__title">Pods</el-text>
      </el-row>
      <pods-table style="margin-top: 10px" :table-pods-loading="tablePodsLoading" :table-pods-data="tablePodDataRaw"></pods-table>


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

    <div v-if="selectedOption==='Container'">
      <container-info :containers="appInfoView.spec.template.spec.containers"></container-info>
      <el-row style="max-width: 80vw" class="row-bg" justify="end">
        <el-button size="default" type="info" plain @click="handleCancelSaveAppJson">{{ t('common.cancel') }}</el-button>
        <el-button size="default" type="success" plain @click="saveAppJson">{{ t('common.save') }}</el-button>
      </el-row>

    </div>

    <div v-if="selectedOption==='Network'">
      <el-row>

        <el-text class="el-descriptions__title">Container</el-text>
        <el-table  v-loading="baseInfoLoading" style="margin-top: 10px" :data="containerInfo">

          <el-table-column :label="t('common.id')" width="60">
            <template #default="scope">
              {{ scope.$index+1  }}
            </template>
          </el-table-column>

          <el-table-column sortable prop="name" :label="t('common.name')" width="240">
          </el-table-column>


          <el-table-column sortable prop="image" :label="t('common.image')" width="360">
          </el-table-column>

          <el-table-column :label="t('common.protocol')" >
            <template #default="scope">
              <el-row v-for="(protocol,index) in scope.row.protocols">
                {{ protocol }}
              </el-row>
            </template>
          </el-table-column>

          <el-table-column :label="t('app-details-page.port-name')" >
            <template #default="scope">
              <el-row v-for="(portName,index) in scope.row.portNames">
                {{ portName }}
              </el-row>
            </template>
          </el-table-column>



          <el-table-column :label="t('app-details-page.container-ports')" >
            <template #default="scope">
              <el-row v-for="(containerPort,index) in scope.row.containerPorts">
                {{ containerPort }}
              </el-row>
            </template>
          </el-table-column>

        </el-table>



        <el-text class="el-descriptions__title" style="margin-top: 10px">Service</el-text>

        <el-table  v-loading="tableServiceLoading" style="margin-top: 10px" :data="appServiceInfo">

          <el-table-column :label="t('common.id')" width="60">
            <template #default="scope">
              {{ scope.$index+1  }}
            </template>
          </el-table-column>

          <el-table-column sortable prop="name" :label="t('common.name')" width="120">
          </el-table-column>


          <el-table-column sortable prop="namespace" :label="t('common.namespace')" width="160">
          </el-table-column>

          <el-table-column sortable prop="type" :label="t('common.type')" width="120">
          </el-table-column>

          <el-table-column sortable prop="clusterIP" label="clusterIP" >
          </el-table-column>

          <el-table-column :label="t('common.mapping')" >
            <template #default="scope">
              <el-row v-for="(item,index) in scope.row.ports">
                {{ portInfoToStr(item) }}
              </el-row>


            </template>
          </el-table-column>

          <el-table-column sortable prop="createdTime" :label="t('common.create-time')" >
            <template #default="scope">
              {{ formattedDate(scope.row.createdTime)  }}
            </template>
          </el-table-column>


        </el-table>

      </el-row>

    </div>
    <div v-if="selectedOption==='Condition'">

      <el-row>

        <el-text class="el-descriptions__title">Condition</el-text>

        <el-table style="margin-top: 10px" :data="appInfo.conditions">

          <el-table-column :label="t('common.id')" width="60">
            <template #default="scope">
              {{ scope.$index+1  }}
            </template>
          </el-table-column>

          <el-table-column sortable prop="type" :label="t('common.type')" width="120">
          </el-table-column>


          <el-table-column sortable prop="status" :label="t('common.status')" width="100">
          </el-table-column>

          <el-table-column sortable prop="reason" :label="t('common.reason')" >
          </el-table-column>

          <el-table-column sortable prop="message" :label="t('common.message')" >
          </el-table-column>

          <el-table-column sortable prop="lastUpdateTime" :label="t('common.last-update-time')" >
            <template #default="scope">
              {{ formattedDate(scope.row.lastUpdateTime)  }}
            </template>
          </el-table-column>


        </el-table>

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
<script  setup>
import {ref} from 'vue'
import {useRoute} from 'vue-router'
import {
  apiDeploymentGet,
  apiDeploymentPodList,
  apiDeploymentServiceList, apiDeploymentUpdate,
  apiDeploymentYamlGet,
  apiDeploymentYamlUpdate
} from "@/services/deployment.js";
import {
  apiStatefulsetGet,
  apiStatefulsetPodList,
  apiStatefulsetServiceList, apiStatefulsetUpdate,
  apiStatefulsetYamlGet,
  apiStatefulsetYamlUpdate
} from "@/services/statefulset.js";
import {
  apiDaemonsetGet,
  apiDaemonsetPodList,
  apiDaemonsetServiceList, apiDaemonsetUpdate,
  apiDaemonsetYamlGet,
  apiDaemonsetYamlUpdate
} from "@/services/daemonset.js";
import {Refresh, Search} from '@element-plus/icons-vue'
import {Codemirror} from "vue-codemirror";
import {yaml} from "@codemirror/lang-yaml";

import {oneDark} from "@codemirror/theme-one-dark";
import {
  apiJobGet,
  apiJobPodList,
  apiJobServiceList,
  apiJobUpdate,
  apiJobYamlGet,
  apiJobYamlUpdate
} from "@/services/job.js";

import {apiPodDelete} from "@/services/pod.js";
import {useDark} from "@vueuse/core";
import {formattedDate} from "../services/common.js";
import { useI18n } from 'vue-i18n'
import ContainerInfo from "@/components/pods/ContainerInfo.vue";
const { t } = useI18n()
const selectedOption = ref('Info')

// const options = ['Info','Env','Metadata','Event' ]
const options = ['Info','Yaml','Container','Network','Condition' ]
const tablePodsLoading = ref(true)
const baseInfoLoading = ref(true)
const tableServiceLoading = ref(true)
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


const appInfoRaw = ref(null)
// appInfoView is updated when appInfoRaw is updated, or user edit it.
const appInfoView = ref(null)
watch(appInfoRaw, (newValue, oldValue) => {
  appInfoView.value = JSON.parse(JSON.stringify(newValue));
})




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
const blockMargin = computed(() => {
  const marginMap = {
    large: '32px',
    default: '28px',
    small: '24px',
  }
  return {
    marginTop: marginMap[size.value] || marginMap.default,
  }
})

const tablePodDataRaw = ref([])

const appServiceInfoRaw = ref([])
const appServiceInfo = computed(()=>{

  if(!appServiceInfoRaw.value){
    return []
  }
  if(route.params.appType === 'Deployment'){
    let result = appServiceInfoRaw.value.map(item => {
      return {
        name: item.metadata.name,
        namespace: item.metadata.namespace,
        createdTime: item.metadata.creationTimestamp,
        type: item.spec.type,
        clusterIP: item.spec.clusterIP,
        ports: item.spec.ports,
        sessionAffinity: item.spec.sessionAffinity
      }
    })
    return result
  }else if(route.params.appType === 'Statefulset'){

    return appServiceInfoRaw.value.map(item => {
      return {
        name: item.metadata.name,
        namespace: item.metadata.namespace,
        createdTime: item.metadata.creationTimestamp,
        type: item.spec.type,
        clusterIP: item.spec.clusterIP,
        ports: item.spec.ports,
        sessionAffinity: item.spec.sessionAffinity
      }
    })

  }else if(route.params.appType === 'Daemonset'){
    return  appServiceInfoRaw.value.map(item => {
      return {
        name: item.metadata.name,
        namespace: item.metadata.namespace,
        createdTime: item.metadata.creationTimestamp,
        type: item.spec.type,
        clusterIP: item.spec.clusterIP,
        ports: item.spec.ports,
        sessionAffinity: item.spec.sessionAffinity
      }
    })
  }else if(route.params.appType === 'Job'){
    return  appServiceInfoRaw.value.map(item => {
      return {
        name: item.metadata.name,
        namespace: item.metadata.namespace,
        createdTime: item.metadata.creationTimestamp,
        type: item.spec.type,
        clusterIP: item.spec.clusterIP,
        ports: item.spec.ports,
        sessionAffinity: item.spec.sessionAffinity
      }
    })
  }

})


const containerInfo = computed(()=>{

  if(appInfoView.value){
    let result = appInfoView.value.spec.template.spec.containers.map((item,index)=>{
      return {
        name: item.name,
        image: item.image,
        protocols: item.ports===undefined?[]:item.ports.map(port=>{
          return port.protocol
        }),
        portNames: item.ports===undefined?[]:item.ports.map(port=>{
          return port.name
        }),
        containerPorts: item.ports===undefined?[]:item.ports.map(port=>{
          return port.containerPort
        }),
      }
    })
    return result
  }
})

const appInfo = computed(()=>{
  if(!appInfoView.value){
    return {}
  }
  if(route.params.appType === 'Deployment'){
    return {
      namespace: appInfoView.value.metadata.namespace,
      name: appInfoView.value.metadata.name,
      createdTime: appInfoView.value.metadata.creationTimestamp,
      generation: appInfoView.value.metadata.generation,
      restartPolicy: appInfoView.value.spec.template.spec.restartPolicy,
      availableReplicas: appInfoView.value.status.availableReplicas? appInfoView.value.status.availableReplicas : 0,
      replicas: appInfoView.value.status.replicas? appInfoView.value.status.replicas : 0,
      conditions: appInfoView.value.status.conditions
    }
  }else if(route.params.appType === 'Statefulset'){

    return {
      namespace: appInfoView.value.metadata.namespace,
      name: appInfoView.value.metadata.name,
      createdTime: appInfoView.value.metadata.creationTimestamp,
      generation: appInfoView.value.metadata.generation,
      restartPolicy: appInfoView.value.spec.template.spec.restartPolicy,
      availableReplicas: appInfoView.value.status.availableReplicas? appInfoView.value.status.availableReplicas : 0,
      replicas: appInfoView.value.status.replicas? appInfoView.value.status.replicas : 0,
      conditions: appInfoView.value.status.conditions

    }
  }else if(route.params.appType === 'Daemonset'){
    return {
      namespace: appInfoView.value.metadata.namespace,
      name: appInfoView.value.metadata.name,
      createdTime: appInfoView.value.metadata.creationTimestamp,
      generation: appInfoView.value.metadata.generation,
      restartPolicy: appInfoView.value.spec.template.spec.restartPolicy,
      availableReplicas: appInfoView.value.status.numberAvailable? appInfoView.value.status.numberAvailable : 0,
      replicas: (appInfoView.value.status.numberAvailable? appInfoView.value.status.numberAvailable : 0)
          + (appInfoView.value.status.numberUnavailable? appInfoView.value.status.numberUnavailable : 0),
      conditions: appInfoView.value.status.conditions

    }
  }else if(route.params.appType === 'Job'){
    return {
      namespace: appInfoView.value.metadata.namespace,
      name: appInfoView.value.metadata.name,
      createdTime: appInfoView.value.metadata.creationTimestamp,
      generation: appInfoView.value.metadata.generation,
      restartPolicy: appInfoView.value.spec.template.spec.restartPolicy,
      availableReplicas: appInfoView.value.status.availableReplicas? appInfoView.value.status.availableReplicas : 0,
      replicas: appInfoView.value.status.replicas? appInfoView.value.status.replicas : 0,
      conditions: appInfoView.value.status.conditions
    }
  }

})

// const tablePodDetailData = ref([
//   [
//     {
//       name: 'kibana',
//       started: 'True',
//       ready: 'True',
//       restartCount: 1,
//       startedAt: "2024-05-02T13:27:00Z"
//     }
//   ]
// ])





const updateAppInfo = async () => {
  baseInfoLoading.value = true
  let wait
  if (route.params.appType === 'Deployment') {
    wait = apiDeploymentGet(route.params.namespace, route.params.appName).then(async res => {
      const resData = await res.json()
      appInfoRaw.value = resData

    }).catch(err => {
      ElMessage({
        message: "request error: " + err,
        type: 'error'
      })
      console.log(err)
    })
  } else if (route.params.appType === 'Statefulset') {
    wait = apiStatefulsetGet(route.params.namespace, route.params.appName).then(async res => {
      const resData = await res.json()
      appInfoRaw.value = resData

    }).catch(err => {
      ElMessage({
        message: "request error: " + err,
        type: 'error'
      })
      console.log(err)
    })
  } else if (route.params.appType === 'Daemonset') {
    wait = apiDaemonsetGet(route.params.namespace, route.params.appName).then(async res => {
      const resData = await res.json()
      appInfoRaw.value = resData

    }).catch(err => {
      ElMessage({
        message: "request error: " + err,
        type: 'error'
      })
      console.log(err)
    })
  } else if (route.params.appType === 'Job') {
    wait = apiJobGet(route.params.namespace, route.params.appName).then(async res => {
      const resData = await res.json()
      appInfoRaw.value = resData

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


const updateTablePodData = async () => {
  tablePodsLoading.value = true
  let wait
  if (route.params.appType === 'Deployment') {
    wait = apiDeploymentPodList(route.params.namespace, route.params.appName).then(async res => {
      const resData = await res.json()
      tablePodDataRaw.value = resData

    }).catch(err => {
      ElMessage({
        message: "request error: " + err,
        type: 'error'
      })
      console.log(err)
    })
  } else if (route.params.appType === 'Statefulset') {
    wait = apiStatefulsetPodList(route.params.namespace, route.params.appName).then(async res => {
      const resData = await res.json()
      tablePodDataRaw.value = resData


    }).catch(err => {
      ElMessage({
        message: "request error: " + err,
        type: 'error'
      })
      console.log(err)
    })
  } else if (route.params.appType === 'Daemonset') {
    wait = apiDaemonsetPodList(route.params.namespace, route.params.appName).then(async res => {
      const resData = await res.json()
      tablePodDataRaw.value = resData


    }).catch(err => {
      ElMessage({
        message: "request error: " + err,
        type: 'error'
      })
      console.log(err)
    })
  } else if (route.params.appType === 'Job') {
    wait = apiJobPodList(route.params.namespace, route.params.appName).then(async res => {
      const resData = await res.json()
      tablePodDataRaw.value = resData


    }).catch(err => {
      ElMessage({
        message: "request error: " + err,
        type: 'error'
      })
      console.log(err)
    })
  }
  await wait
  tablePodsLoading.value = false
}

const updateAppNetworkInfo = async () => {
  tableServiceLoading.value = true
  let wait
  if (route.params.appType === 'Deployment') {
    wait = apiDeploymentServiceList(route.params.namespace, route.params.appName).then(async res => {
      const resData = await res.json()
      appServiceInfoRaw.value = resData

    }).catch(err => {
      ElMessage({
        message: "request error: " + err,
        type: 'error'
      })
      console.log(err)
    })
  } else if (route.params.appType === 'Statefulset') {
    wait = apiStatefulsetServiceList(route.params.namespace, route.params.appName).then(async res => {
      const resData = await res.json()
      appServiceInfoRaw.value = resData

    }).catch(err => {
      ElMessage({
        message: "request error: " + err,
        type: 'error'
      })
      console.log(err)
    })
  } else if (route.params.appType === 'Daemonset') {
    wait = apiDaemonsetServiceList(route.params.namespace, route.params.appName).then(async res => {
      const resData = await res.json()
      appServiceInfoRaw.value = resData

    }).catch(err => {
      ElMessage({
        message: "request error: " + err,
        type: 'error'
      })
      console.log(err)
    })
  } else if (route.params.appType === 'Job') {
    wait = apiJobServiceList(route.params.namespace, route.params.appName).then(async res => {
      const resData = await res.json()
      appServiceInfoRaw.value = resData

    }).catch(err => {
      ElMessage({
        message: "request error: " + err,
        type: 'error'
      })
      console.log(err)
    })
  }
  await wait
  tableServiceLoading.value = false
}

const updateAppYaml = async () => {
  yamlLoading.value = true
  let wait
  if (route.params.appType === 'Deployment') {
    wait = apiDeploymentYamlGet(route.params.namespace, route.params.appName).then(async res => {
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
  } else if (route.params.appType === 'Statefulset') {
    wait = apiStatefulsetYamlGet(route.params.namespace, route.params.appName).then(async res => {
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
  } else if (route.params.appType === 'Daemonset') {
    wait = apiDaemonsetYamlGet(route.params.namespace, route.params.appName).then(async res => {
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
  } else if (route.params.appType === 'Job') {
    wait = apiJobYamlGet(route.params.namespace, route.params.appName).then(async res => {
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
  let updateAppYaml = undefined;
  if(route.params.appType === 'Deployment'){
    updateAppYaml = apiDeploymentYamlUpdate
  }else if(route.params.appType === 'Statefulset'){
    updateAppYaml = apiStatefulsetYamlUpdate
  }else if(route.params.appType === 'Daemonset'){
    updateAppYaml = apiDaemonsetYamlUpdate
  }else if(route.params.appType === 'Job'){
    updateAppYaml = apiJobYamlUpdate
  }
  if(updateAppYaml){
    updateAppYaml(route.params.namespace,route.params.appName,yamlCode.value).then(async res => {

      if(res.status === 200){

        await res.text()
        setTimeout(() => {
          refreshData()
          ElMessage({
            message: "update yaml success",
            type: 'success'
          })
        }, 2000)


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

const handleCancelSaveYaml = () => {
  yamlCode.value = yamlCodeRaw.value
}


const handleCancelSaveAppJson = () => {
  console.log("?!",appInfoView)
  appInfoView.value = appInfoRaw.value
}

const saveAppJson = () => {
  let updateApp = undefined;
  if(route.params.appType === 'Deployment'){
    updateApp = apiDeploymentUpdate
  }else if(route.params.appType === 'Statefulset'){
    updateApp = apiStatefulsetUpdate
  }else if(route.params.appType === 'Daemonset'){
    updateApp = apiDaemonsetUpdate
  }else if(route.params.appType === 'Job'){
    updateApp = apiJobUpdate
  }

  if(updateApp){
    updateApp(route.params.namespace,route.params.appName,appInfoView.value).then(async res => {

      if(res.status === 200){
        ElMessage({
          message: "update app success",
          type: 'success'
        })
        await res.text()
        setTimeout(() => {
          refreshData()
        }, 2000)

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
  }else{
    ElMessage({
      message: `update app error, unsupport app type ${route.params.appType}`,
      type: 'error'
    })
  }



}





const refreshData = () => {
  updateAppInfo()
  updateTablePodData()
  updateAppNetworkInfo()
  updateAppYaml()
}
const timer = setInterval(() => {
  if(isAutoRefresh.value){
    refreshData()
  }

}, 10000)

onUnmounted(() => {
  clearInterval(timer)
})


const portInfoToStr = (portInfo)=>{
  let portInfoStr = portInfo.protocol + " "
  if(portInfo.nodePort){
    portInfoStr += portInfo.nodePort + " → "
  }
  portInfoStr +=  portInfo.port + " → " + portInfo.targetPort
  return portInfoStr
}

onMounted(() => {
  refreshData()
})
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
