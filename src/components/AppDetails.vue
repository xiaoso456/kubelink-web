<template>
  <div class="custom-style" style="margin-left: 10px;">
    <el-row>
      <el-segmented size="large"  v-model="selectedOption" :options="options" >
        <template #default="scope">
          <div style="padding: 0px 20px 0px 20px;">
            <el-text tag="b">{{ scope.item }}</el-text>
          </div>
        </template>
      </el-segmented>
    </el-row>

    <div v-if="selectedOption==='Info'">
      <el-row>

        <el-descriptions v-loading="baseInfoLoading"
                         class="margin-top"
                         title="Base Info"
                         :column="3"
                         :size="size"
                         border
        >
          <template #extra>

            <el-tooltip  placement="top-start" effect="light" content="Refresh data every 10s">
              <el-button  round plain link @click="() => {isAutoRefresh = !isAutoRefresh;refreshData()}">
                <el-icon :class="{'is-loading':isAutoRefresh}" >
                  <Refresh />
                </el-icon>
              </el-button >
            </el-tooltip>

          </template>
          <el-descriptions-item>
            <template #label>
              <div class="cell-item">
                <el-icon :style="iconStyle">
                  <House />
                </el-icon>
                Namespace
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
                Name
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
                Replicas
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
                RestartPolicy
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
                Generation
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
                CreatedTime
              </div>
            </template>
            {{ formattedDate(appInfo.createdTime) }}
          </el-descriptions-item>
        </el-descriptions>



      </el-row>
      <el-row>
          <el-text class="el-descriptions__title">Pods</el-text>
      </el-row>
      <el-row>
        <el-table style="margin-top: 10px" :data="tablePodData"  v-loading="tablePodsLoading">

          <el-table-column sortable prop="name" label="Name" width="200">
            <template #default="scope">
              <el-tooltip
                  effect="light"
                  content="Top Left prompts info"
                  placement="top-start"
              >
                <template #content>
                  <el-table :data="scope.row.podInfo.containers" >

                    <el-table-column prop="name" label="Name" min-width="240">
                      <template #default="scopeContainer">
                        {{ scope.row.podInfo.containers[scopeContainer.$index].name }}
                      </template>
                    </el-table-column>
                    <el-table-column  label="Started" >
                      <template #default="scopeContainer">
                        <el-row style="align-items: center">
                          <div :class="scope.row.podInfo.containerStatuses[scopeContainer.$index].started?'circle-green':'circle-red'"></div>
                          {{ scope.row.podInfo.containerStatuses[scopeContainer.$index].started }}

                        </el-row>
                      </template>
                    </el-table-column>
                    <el-table-column  label="Ready" >
                      <template #default="scopeContainer">
                        <el-row style="align-items: center">
                          <div :class="scope.row.podInfo.containerStatuses[scopeContainer.$index].ready?'circle-green':'circle-red'"></div>

                          {{ scope.row.podInfo.containerStatuses[scopeContainer.$index].ready }}
                        </el-row>

                      </template>
                    </el-table-column>
                    <el-table-column  label="RestartCount"  width="120">
                      <template #default="scopeContainer">
                        {{ scope.row.podInfo.containerStatuses[scopeContainer.$index].restartCount }}
                      </template>
                    </el-table-column>
                    <el-table-column  label="StartedAt" width="180">
                      <template #default="scopeContainer">
                        {{ formattedDate(scope.row.podInfo.containerStatuses[scopeContainer.$index].state.running.startedAt) }}
                      </template>
                    </el-table-column>
                    <el-table-column  label="Operation" width="180">
                      <template #default="scopeContainer">
                        <el-button size="small" type="primary" plain @click="()=>{
                          $router.push('/pod/namespace/'+appInfo.namespace+'/pod/'+scope.row.podInfo.podName+'/container/'+scope.row.podInfo.containers[scopeContainer.$index].name + '/Logs')
                        } ">logs</el-button>
                      </template>
                    </el-table-column>
                  </el-table>
                </template>

                {{ scope.row.name }}
              </el-tooltip>
            </template>
          </el-table-column>


          <el-table-column sortable label="Node" >
            <template #default="scope">
              {{ scope.row.nodeName  }}({{ scope.row.hostIP}})
            </template>
          </el-table-column>

          <el-table-column sortable prop="status" label="Status" >

          </el-table-column>

          <el-table-column sortable prop="podIP" label="PodIP" >
            <template #default="scope">

              {{ scope.row.podInfo.podIP  }}
            </template>
          </el-table-column>

          <el-table-column sortable prop="restartTimes" label="RestartTimes" >

          </el-table-column>

          <el-table-column sortable label="CreatedTime" width="180">
            <template #default="scope">
              {{ formattedDate(scope.row.CreatedTime)  }}
            </template>

          </el-table-column>

          <el-table-column  label="Operation">
            <template #default="scope">
              <el-button size="small" type="primary" plain @click="()=>{
                          $router.push('/pod/namespace/'+appInfo.namespace+'/pod/'+scope.row.podInfo.podName+'/container/_null/Logs')
                        } ">logs
              </el-button>
              <el-button size="small" type="danger" plain @click="handleDeletePod(scope.row)">delete
              </el-button>

            </template>
          </el-table-column>
        </el-table>

      </el-row>
    </div>
    <div v-if="selectedOption==='Yaml'">

      <el-scrollbar v-loading="yamlLoading" height="65vh"  style="max-width:900px;margin-top: 10px">

        <codemirror

            v-model="yamlCode"
            placeholder="Code goes here..."
            :autofocus="true"
            :indent-with-tab="true"
            :tab-size="2"
            :extensions="codeExtensions"
        />
      </el-scrollbar>
      <el-row style="max-width: 900px" class="row-bg" justify="end">
        <el-button size="default" type="info" plain @click="handleCancelSaveYaml">Cancel</el-button>
        <el-button size="default" type="success" plain @click="saveAppYaml">Save</el-button>
      </el-row>



    </div>
    <div v-if="selectedOption==='Network'">
      <el-row>

        <el-text class="el-descriptions__title">Container</el-text>
        <el-table  v-loading="baseInfoLoading" style="margin-top: 10px" :data="containerInfo">

          <el-table-column label="Id" width="60">
            <template #default="scope">
              {{ scope.$index+1  }}
            </template>
          </el-table-column>

          <el-table-column sortable prop="name" label="Name" width="240">
          </el-table-column>


          <el-table-column sortable prop="image" label="image" width="360">
          </el-table-column>

          <el-table-column label="protocol" >
            <template #default="scope">
              <el-row v-for="(protocol,index) in scope.row.protocols">
                {{ protocol }}
              </el-row>
            </template>
          </el-table-column>

          <el-table-column label="portName" >
            <template #default="scope">
              <el-row v-for="(portName,index) in scope.row.portNames">
                {{ portName }}
              </el-row>
            </template>
          </el-table-column>



          <el-table-column label="containerPorts" >
            <template #default="scope">
              <el-row v-for="(containerPort,index) in scope.row.containerPorts">
                {{ containerPort }}
              </el-row>
            </template>
          </el-table-column>

        </el-table>



        <el-text class="el-descriptions__title" style="margin-top: 10px">Service</el-text>

        <el-table  v-loading="tableServiceLoading" style="margin-top: 10px" :data="appServiceInfo">

          <el-table-column label="Id" width="60">
            <template #default="scope">
              {{ scope.$index+1  }}
            </template>
          </el-table-column>

          <el-table-column sortable prop="name" label="Name" width="120">
          </el-table-column>


          <el-table-column sortable prop="namespace" label="namespace" width="160">
          </el-table-column>

          <el-table-column sortable prop="type" label="type" width="120">
          </el-table-column>

          <el-table-column sortable prop="clusterIP" label="clusterIP" >
          </el-table-column>

          <el-table-column label="mapping" >
            <template #default="scope">
              <el-row v-for="(item,index) in scope.row.ports">
                {{ portInfoToStr(item) }}
              </el-row>


            </template>
          </el-table-column>

          <el-table-column sortable prop="createdTime" label="createdTime" >
            <template #default="scope">
              {{ formattedDate(scope.row.createdTime)  }}
            </template>
          </el-table-column>


        </el-table>

      </el-row>

    </div>
    <div v-if="selectedOption==='Condition'">

      <el-row>

        <el-text class="el-descriptions__title">{{route.params.appType}}</el-text>

        <el-table style="margin-top: 10px" :data="appInfo.conditions">

          <el-table-column label="Id" width="60">
            <template #default="scope">
              {{ scope.$index+1  }}
            </template>
          </el-table-column>

          <el-table-column sortable prop="type" label="Type" width="120">
          </el-table-column>


          <el-table-column sortable prop="status" label="status" width="100">
          </el-table-column>

          <el-table-column sortable prop="reason" label="reason" >
          </el-table-column>

          <el-table-column sortable prop="message" label="message" >
          </el-table-column>

          <el-table-column sortable prop="lastUpdateTime" label="lastUpdateTime" >
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
        <el-button @click="dialogVisible = false">Cancel</el-button>
        <el-button type="primary" @click="dialogConfirmFuctionLast">
          Confirm
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
  apiDeploymentYamlGet, apiDeploymentYamlUpdate
} from "@/services/deployment.js";
import {
  apiStatefulsetGet,
  apiStatefulsetPodList,
  apiStatefulsetServiceList,
  apiStatefulsetYamlGet, apiStatefulsetYamlUpdate
} from "@/services/statefulset.js";
import {
  apiDaemonsetGet,
  apiDaemonsetPodList,
  apiDaemonsetServiceList,
  apiDaemonsetYamlGet, apiDaemonsetYamlUpdate
} from "@/services/daemonset.js";
import dayjs from "dayjs";
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import {
  Refresh
} from '@element-plus/icons-vue'
import {Codemirror} from "vue-codemirror";
import {yaml} from "@codemirror/lang-yaml";

import {oneDark} from "@codemirror/theme-one-dark";
import {apiJobGet, apiJobPodList, apiJobServiceList, apiJobYamlGet, apiJobYamlUpdate} from "@/services/job.js";
import {apiPodDelete} from "@/services/pod.js";
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


const codeExtensions = [
  yaml(),
  oneDark,
]

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

const item = {
  name: 'remote-k8s',
  nodeName: 'node1',
  hostIP: '127.0.0.1',
  status: 'Running',
  podInfo:{
    podName: 'remote-k8s',
    podIP: '127.0.0.1',
    containers: [
      {
        "env": [
          {
            "name": "BITNAMI_DEBUG",
            "value": "false"
          },
          {
            "name": "KIBANA_PORT_NUMBER",
            "value": "5601"
          },
          {
            "name": "KIBANA_ELASTICSEARCH_URL",
            "value": "http://my-elasticsearch:9200"
          },
          {
            "name": "KIBANA_ELASTICSEARCH_PORT_NUMBER",
            "value": "9200"
          },
          {
            "name": "KIBANA_FORCE_INITSCRIPTS",
            "value": "false"
          },
          {
            "name": "KIBANA_SERVER_ENABLE_TLS",
            "value": "false"
          },
          {
            "name": "KIBANA_ELASTICSEARCH_ENABLE_TLS",
            "value": "false"
          },
          {
            "name": "KIBANA_ELASTICSEARCH_TLS_USE_PEM",
            "value": "false"
          },
          {
            "name": "KIBANA_ELASTICSEARCH_TLS_VERIFICATION_MODE",
            "value": "full"
          }
        ],
        "image": "docker.io/bitnami/kibana:8.11.4-debian-11-r0",
        "imagePullPolicy": "IfNotPresent",
        "livenessProbe": {
          "failureThreshold": 6,
          "httpGet": {
            "path": "/login",
            "port": null,
            "scheme": "HTTP"
          },
          "initialDelaySeconds": 120,
          "periodSeconds": 10,
          "successThreshold": 1,
          "timeoutSeconds": 5
        },
        "name": "kibana",
        "ports": [
          {
            "containerPort": 5601,
            "name": "http",
            "protocol": "TCP"
          }
        ],
        "readinessProbe": {
          "failureThreshold": 6,
          "httpGet": {
            "path": "/status",
            "port": null,
            "scheme": "HTTP"
          },
          "initialDelaySeconds": 30,
          "periodSeconds": 10,
          "successThreshold": 1,
          "timeoutSeconds": 5
        },
        "resources": {
          "limits": {},
          "requests": {}
        },
        "securityContext": {
          "allowPrivilegeEscalation": false,
          "capabilities": {
            "drop": [
              "ALL"
            ]
          },
          "privileged": false,
          "readOnlyRootFilesystem": false,
          "runAsNonRoot": true,
          "runAsUser": 1001,
          "seLinuxOptions": {},
          "seccompProfile": {
            "type": "RuntimeDefault"
          }
        },
        "terminationMessagePath": "/dev/termination-log",
        "terminationMessagePolicy": "File",
        "volumeMounts": [
          {
            "mountPath": "/bitnami/kibana",
            "name": "kibana-data"
          },
          {
            "mountPath": "/bitnami/kibana/conf",
            "name": "kibana-config"
          }
        ]
      }
    ],
    containerStatuses: [
      {
        "allocatedResources": {},
        "containerID": "docker://99fe92234f9b5bcd2c89568570304e79102b20035eb214b8ef157f2731c4b572",
        "image": "bitnami/kibana:8.11.4-debian-11-r0",
        "imageID": "docker-pullable://bitnami/kibana@sha256:fc2b13b68ff40c857c7659cc9b9e18c54b08e42fc43421e9cf9b653e22472f8c",
        "lastState": {},
        "name": "kibana",
        "ready": true,
        "restartCount": 0,
        "started": true,
        "state": {
          "running": {
            "startedAt": "2024-05-02T13:27:00Z"
          }
        }
      }
    ],
    conditions: [
      {
        "lastTransitionTime": "2024-05-02T13:26:59Z",
        "status": "True",
        "type": "Initialized"
      },
      {
        "lastTransitionTime": "2024-05-02T13:27:49Z",
        "status": "True",
        "type": "Ready"
      },
      {
        "lastTransitionTime": "2024-05-02T13:27:49Z",
        "status": "True",
        "type": "ContainersReady"
      },
      {
        "lastTransitionTime": "2024-05-02T13:26:59Z",
        "status": "True",
        "type": "PodScheduled"
      }
    ],
  },
  restartTimes: 0,
  createdTime: '2024-01-01T00:00:00Z'
}
const tablePodData = ref(Array.from({ length: 1 }).fill(item))

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
      replicas: appInfoRaw.value.status.replicas? appInfoRaw.value.status.replicas : 0
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
          + (appInfoRaw.value.status.numberUnavailable? appInfoRaw.value.status.numberUnavailable : 0)

    }
  }else if(route.params.appType === 'Job'){
    return {
      namespace: appInfoRaw.value.metadata.namespace,
      name: appInfoRaw.value.metadata.name,
      createdTime: appInfoRaw.value.metadata.creationTimestamp,
      generation: appInfoRaw.value.metadata.generation,
      restartPolicy: appInfoRaw.value.spec.template.spec.restartPolicy,
      availableReplicas: appInfoRaw.value.status.availableReplicas? appInfoRaw.value.status.availableReplicas : 0,
      replicas: appInfoRaw.value.status.replicas? appInfoRaw.value.status.replicas : 0
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
dayjs.extend(utc)
dayjs.extend(timezone);

const formattedDate = (dateStr) =>{
  if(!dateStr){
    return '-'
  }
  return dayjs(dateStr).format('YYYY-MM-DD HH:mm:ss');
}


const updateAppInfo = () => {
  baseInfoLoading.value = true
  if(route.params.appType === 'Deployment'){
    apiDeploymentGet(route.params.namespace,route.params.appName).then(async res => {
      const resData = await res.json()
      appInfoRaw.value = resData

    }).catch(err => {
      ElMessage({
        message: "request error: " + err,
        type: 'error'
      })
      console.log(err)
    })
  }else if(route.params.appType === 'Statefulset'){
    apiStatefulsetGet(route.params.namespace,route.params.appName).then(async res => {
      const resData = await res.json()
      appInfoRaw.value = resData

    }).catch(err => {
      ElMessage({
        message: "request error: " + err,
        type: 'error'
      })
      console.log(err)
    })
  }else if(route.params.appType === 'Daemonset'){
    apiDaemonsetGet(route.params.namespace,route.params.appName).then(async res => {
      const resData = await res.json()
      appInfoRaw.value = resData

    }).catch(err => {
      ElMessage({
        message: "request error: " + err,
        type: 'error'
      })
      console.log(err)
    })
  }else if(route.params.appType === 'Job'){
    apiJobGet(route.params.namespace,route.params.appName).then(async res => {
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
  baseInfoLoading.value = false
}


const updateTablePodData = () => {
  tablePodsLoading.value = true
  if(route.params.appType === 'Deployment'){
    apiDeploymentPodList(route.params.namespace,route.params.appName).then(async res => {
      const resData = await res.json()
      tablePodData.value = resData.map(item => {
        return {
          name: item.metadata.name,
          nodeName: item.spec.nodeName,
          hostIP: item.status.hostIP,
          status: item.status.phase,
          podInfo:{
            podName: item.metadata.name,
            podIP: item.status.podIP,
            containers: item.spec.containers,
            containerStatuses: item.status.containerStatuses,
            conditions: item.status.conditions
          },
          createdTime: item.metadata.creationTimestamp,
          restartTimes: item.status.containerStatuses[0].restartCount

        }
      })

    }).catch(err => {
      ElMessage({
        message: "request error: " + err,
        type: 'error'
      })
      console.log(err)
    })
  }else if(route.params.appType === 'Statefulset'){
    apiStatefulsetPodList(route.params.namespace,route.params.appName).then(async res => {
      const resData = await res.json()
      tablePodData.value = resData.map(item => {
        return {
          name: item.metadata.name,
          nodeName: item.spec.nodeName,
          hostIP: item.status.hostIP,
          status: item.status.phase,
          podInfo:{
            podName: item.metadata.name,
            podIP: item.status.podIP,
            containers: item.spec.containers,
            containerStatuses: item.status.containerStatuses,
            conditions: item.status.conditions
          },
          createdTime: item.metadata.creationTimestamp,
          restartTimes: item.status.containerStatuses[0].restartCount

        }
      })

    }).catch(err => {
      ElMessage({
        message: "request error: " + err,
        type: 'error'
      })
      console.log(err)
    })
  }else if(route.params.appType === 'Daemonset'){
    apiDaemonsetPodList(route.params.namespace,route.params.appName).then(async res => {
      const resData = await res.json()
      tablePodData.value = resData.map(item => {
        return {
          name: item.metadata.name,
          nodeName: item.spec.nodeName,
          hostIP: item.status.hostIP,
          status: item.status.phase,
          podInfo:{
            podName: item.metadata.name,
            podIP: item.status.podIP,
            containers: item.spec.containers,
            containerStatuses: item.status.containerStatuses,
            conditions: item.status.conditions
          },
          createdTime: item.metadata.creationTimestamp,
          restartTimes: item.status.containerStatuses[0].restartCount

        }
      })

    }).catch(err => {
      ElMessage({
        message: "request error: " + err,
        type: 'error'
      })
      console.log(err)
    })
  }else if(route.params.appType === 'Job'){
    apiJobPodList(route.params.namespace,route.params.appName).then(async res => {
      const resData = await res.json()
      tablePodData.value = resData.map(item => {
        return {
          name: item.metadata.name,
          nodeName: item.spec.nodeName,
          hostIP: item.status.hostIP,
          status: item.status.phase,
          podInfo:{
            podName: item.metadata.name,
            podIP: item.status.podIP,
            containers: item.spec.containers,
            containerStatuses: item.status.containerStatuses,
            conditions: item.status.conditions
          },
          createdTime: item.metadata.creationTimestamp,
          restartTimes: item.status.containerStatuses[0].restartCount

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
  tablePodsLoading.value = false
}

const updateAppNetworkInfo = () => {
  tableServiceLoading.value = true
  if(route.params.appType === 'Deployment'){
    apiDeploymentServiceList(route.params.namespace,route.params.appName).then(async res => {
      const resData = await res.json()
      appServiceInfoRaw.value = resData

    }).catch(err => {
      ElMessage({
        message: "request error: " + err,
        type: 'error'
      })
      console.log(err)
    })
  }else if(route.params.appType === 'Statefulset'){
    apiStatefulsetServiceList(route.params.namespace,route.params.appName).then(async res => {
      const resData = await res.json()
      appServiceInfoRaw.value = resData

    }).catch(err => {
      ElMessage({
        message: "request error: " + err,
        type: 'error'
      })
      console.log(err)
    })
  }else if(route.params.appType === 'Daemonset'){
    apiDaemonsetServiceList(route.params.namespace,route.params.appName).then(async res => {
      const resData = await res.json()
      appServiceInfoRaw.value = resData

    }).catch(err => {
      ElMessage({
        message: "request error: " + err,
        type: 'error'
      })
      console.log(err)
    })
  }else if(route.params.appType === 'Job'){
    apiJobServiceList(route.params.namespace,route.params.appName).then(async res => {
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
  tableServiceLoading.value = false
}

const updateAppYaml = () => {
  yamlLoading.value = true
  if(route.params.appType === 'Deployment'){
    apiDeploymentYamlGet(route.params.namespace,route.params.appName).then(async res => {
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
  }else if(route.params.appType === 'Statefulset'){
    apiStatefulsetYamlGet(route.params.namespace,route.params.appName).then(async res => {
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
  }else if(route.params.appType === 'Daemonset'){
    apiDaemonsetYamlGet(route.params.namespace,route.params.appName).then(async res => {
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
  }else if(route.params.appType === 'Job'){
    apiJobYamlGet(route.params.namespace,route.params.appName).then(async res => {
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

setInterval(() => {
  if(isAutoRefresh.value){
    refreshData()
  }

}, 10000)

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
  --el-segmented-item-selected-color: var(--el-text-color-primary);
  --el-segmented-item-selected-bg-color: #3987e0;
  --el-border-radius-base: 3px;

}
.custom-style .el-row{
  padding-top: 10px;
}



</style>
