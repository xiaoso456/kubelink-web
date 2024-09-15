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
  apiDeploymentServiceList,
  apiDeploymentYamlGet,
  apiDeploymentYamlUpdate
} from "@/services/deployment.js";
import {
  apiStatefulsetGet,
  apiStatefulsetPodList,
  apiStatefulsetServiceList,
  apiStatefulsetYamlGet,
  apiStatefulsetYamlUpdate
} from "@/services/statefulset.js";
import {
  apiDaemonsetGet,
  apiDaemonsetPodList,
  apiDaemonsetServiceList,
  apiDaemonsetYamlGet,
  apiDaemonsetYamlUpdate
} from "@/services/daemonset.js";
import {Refresh} from '@element-plus/icons-vue'
import {Codemirror} from "vue-codemirror";
import {yaml} from "@codemirror/lang-yaml";

import {oneDark} from "@codemirror/theme-one-dark";
import {apiJobGet, apiJobPodList, apiJobServiceList, apiJobYamlGet, apiJobYamlUpdate} from "@/services/job.js";
import {apiPodDelete} from "@/services/pod.js";
import {useDark} from "@vueuse/core";
import {formattedDate} from "../services/common.js";
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
const selectedOption = ref('Info')

// const options = ['Info','Env','Metadata','Event' ]
const options = ['Info','Yaml','Network','Condition' ]
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
    console.log(result)
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
// const appServiceInfo = ref([{
//   name: 'mysql',
//   namespace: 'default',
//   createdTime: '2023-10-07T13:38:06Z',
//   type: 'ClusterIP',
//   clusterIP: '10.96.0.1',
//   ports: [
//     {
//       "name": "tcp-5005",
//       "nodePort": 31118,
//       "port": 5005,
//       "protocol": "TCP",
//       "targetPort": 5006
//     }
//   ],
//   sessionAffinity: 'None',
// }])


const appInfoRaw = ref(null)
const containerInfo = computed(()=>{

  if(appInfoRaw.value){
    let result = appInfoRaw.value.spec.template.spec.containers.map((item,index)=>{
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
  if(!appInfoRaw.value){
    return {}
  }
  if(route.params.appType === 'Deployment'){
    return {
      namespace: appInfoRaw.value.metadata.namespace,
      name: appInfoRaw.value.metadata.name,
      createdTime: appInfoRaw.value.metadata.creationTimestamp,
      generation: appInfoRaw.value.metadata.generation,
      restartPolicy: appInfoRaw.value.spec.template.spec.restartPolicy,
      availableReplicas: appInfoRaw.value.status.availableReplicas? appInfoRaw.value.status.availableReplicas : 0,
      replicas: appInfoRaw.value.status.replicas? appInfoRaw.value.status.replicas : 0,
      conditions: appInfoRaw.value.status.conditions
    }
  }else if(route.params.appType === 'Statefulset'){

    return {
      namespace: appInfoRaw.value.metadata.namespace,
      name: appInfoRaw.value.metadata.name,
      createdTime: appInfoRaw.value.metadata.creationTimestamp,
      generation: appInfoRaw.value.metadata.generation,
      restartPolicy: appInfoRaw.value.spec.template.spec.restartPolicy,
      availableReplicas: appInfoRaw.value.status.availableReplicas? appInfoRaw.value.status.availableReplicas : 0,
      replicas: appInfoRaw.value.status.replicas? appInfoRaw.value.status.replicas : 0,
      conditions: appInfoRaw.value.status.conditions

    }
  }else if(route.params.appType === 'Daemonset'){
    return {
      namespace: appInfoRaw.value.metadata.namespace,
      name: appInfoRaw.value.metadata.name,
      createdTime: appInfoRaw.value.metadata.creationTimestamp,
      generation: appInfoRaw.value.metadata.generation,
      restartPolicy: appInfoRaw.value.spec.template.spec.restartPolicy,
      availableReplicas: appInfoRaw.value.status.numberAvailable? appInfoRaw.value.status.numberAvailable : 0,
      replicas: (appInfoRaw.value.status.numberAvailable? appInfoRaw.value.status.numberAvailable : 0)
          + (appInfoRaw.value.status.numberUnavailable? appInfoRaw.value.status.numberUnavailable : 0),
      conditions: appInfoRaw.value.status.conditions

    }
  }else if(route.params.appType === 'Job'){
    return {
      namespace: appInfoRaw.value.metadata.namespace,
      name: appInfoRaw.value.metadata.name,
      createdTime: appInfoRaw.value.metadata.creationTimestamp,
      generation: appInfoRaw.value.metadata.generation,
      restartPolicy: appInfoRaw.value.spec.template.spec.restartPolicy,
      availableReplicas: appInfoRaw.value.status.availableReplicas? appInfoRaw.value.status.availableReplicas : 0,
      replicas: appInfoRaw.value.status.replicas? appInfoRaw.value.status.replicas : 0,
      conditions: appInfoRaw.value.status.conditions
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
  if(route.params.appType === 'Deployment'){
    apiDeploymentYamlUpdate(route.params.namespace,route.params.appName,yamlCode.value).then(async res => {

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
  }else if(route.params.appType === 'Statefulset'){
    apiStatefulsetYamlUpdate(route.params.namespace,route.params.appName,yamlCode.value).then(async res => {

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
  }else if(route.params.appType === 'Daemonset'){
    apiDaemonsetYamlUpdate(route.params.namespace,route.params.appName,yamlCode.value).then(async res => {

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
  }else if(route.params.appType === 'Job'){
    apiJobYamlUpdate(route.params.namespace,route.params.appName,yamlCode.value).then(async res => {

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

const handleCancelSaveYaml = () => {
  yamlCode.value = yamlCodeRaw.value
}

const handleDeletePod = (row) => {
  dialogVisible.value = true
  dialogTitle.value = "Tips"
  dialogMessage.value = `Delete pod '${row.name}' `
  dialogConfirmFuction.value = () => {
    apiPodDelete(route.params.namespace,row.name).then(async res => {

      if(res.status === 200){
        ElMessage({
          message: "delete pod success",
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
