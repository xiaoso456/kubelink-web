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


    <el-row>

      <el-descriptions
          class="margin-top"
          title="Base Info"
          :column="3"
          :size="size"
          border
      >
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

      <el-table :data="tablePodData" >

        <el-table-column prop="name" label="Name" width="200">
            <template #default="scope">
              <el-tooltip
                  effect="light"
                  content="Top Left prompts info"
                  placement="top-start"
              >
                <template #content>
                  <el-table :data="scope.row.podInfo.containers">

                    <el-table-column prop="name" label="Name" min-width="240">
                      <template #default="scopeContainer">
                        {{ scope.row.podInfo.containers[scopeContainer.$index].name }}
                      </template>
                    </el-table-column>
                    <el-table-column  label="Started" >
                      <template #default="scopeContainer">
                        {{ scope.row.podInfo.containerStatuses[scopeContainer.$index].started }}
                      </template>
                    </el-table-column>
                    <el-table-column  label="Ready" >
                      <template #default="scopeContainer">
                        {{ scope.row.podInfo.containerStatuses[scopeContainer.$index].ready }}
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


        <el-table-column  label="Node" >
          <template #default="scope">
            {{ scope.row.nodeName  }}({{ scope.row.hostIP}})
          </template>


        </el-table-column>

        <el-table-column prop="status" label="Status" >

        </el-table-column>

        <el-table-column prop="podIP" label="PodIP" >
          <template #default="scope">

                {{ scope.row.podInfo.podIP  }}
          </template>
        </el-table-column>

        <el-table-column prop="restartTimes" label="RestartTimes" >

        </el-table-column>

        <el-table-column label="CreatedTime" width="180">
          <template #default="scope">
            {{ formattedDate(scope.row.CreatedTime)  }}
          </template>

        </el-table-column>

      </el-table>

    </el-row>

  </div>
</template>
<script  setup>
import {ref} from 'vue'
import {useRoute} from 'vue-router'
import {apiDeploymentGet, apiDeploymentPodList} from "@/services/deployment.js";
import {apiStatefulsetGet, apiStatefulsetPodList} from "@/services/statefulset.js";
import {apiDaemonsetGet, apiDaemonsetPodList} from "@/services/daemonset.js";
import dayjs from "dayjs";
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

const selectedOption = ref('Info')

// const options = ['Info','Env','Metadata','Event' ]
const options = ['Info' ]


const size = ref('large')

const route = useRoute()

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

const appInfo =ref({
  namespace: 'default',
  name: 'remote-k8s',
  createdTime: '2024-01-01 00:00:00',
  restartPolicy: 'Always',
  availableReplicas: 1,
  replicas:1,
  generation: 1
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
  if(route.params.appType === 'Deployment'){
    apiDeploymentGet(route.params.namespace,route.params.appName).then(async res => {
      const resData = await res.json()
      appInfo.value = {
        namespace: resData.metadata.namespace,
        name: resData.metadata.name,
        createdTime: resData.metadata.creationTimestamp,
        generation: resData.metadata.generation,
        restartPolicy: resData.spec.template.spec.restartPolicy,
        availableReplicas: resData.status.availableReplicas? resData.status.availableReplicas : 0,
        replicas: resData.status.replicas? resData.status.replicas : 0
      }

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
      appInfo.value = {
        namespace: resData.metadata.namespace,
        name: resData.metadata.name,
        createdTime: resData.metadata.creationTimestamp,
        generation: resData.metadata.generation,
        restartPolicy: resData.spec.template.spec.restartPolicy,
        availableReplicas: resData.status.availableReplicas? resData.status.availableReplicas : 0,
        replicas: resData.status.replicas? resData.status.replicas : 0
      }

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
      appInfo.value = {
        namespace: resData.metadata.namespace,
        name: resData.metadata.name,
        createdTime: resData.metadata.creationTimestamp,
        generation: resData.metadata.generation,
        restartPolicy: resData.spec.template.spec.restartPolicy,
        availableReplicas: resData.status.numberAvailable? resData.status.numberAvailable : 0,
        replicas: (resData.status.numberAvailable? resData.status.numberAvailable : 0)
          + (resData.status.numberUnavailable? resData.status.numberUnavailable : 0)
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


const updateTablePodData = () => {
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
  }
}

onMounted(() => {
  updateAppInfo()
  updateTablePodData()
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
