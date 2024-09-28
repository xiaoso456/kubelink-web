<template>
  <el-row class="mb-10">
    <el-radio-group v-model="selectedContainerName" >
      <el-radio-button v-for="container in containers" :label="container.name" :value="container.name" />
    </el-radio-group>
  </el-row>
  <el-scrollbar max-height="70vh">

    <el-row>
      <el-text class="el-descriptions__title">{{ t('app-details-page.base-info') }}</el-text>
    </el-row>

    <el-row>
      <el-form :model="selectedContainer" class="none-box" style="max-width: 1000px;min-width: 80vw" label-width="auto" label-position="left">
        <el-form-item :label="t('common.image')" >
          <el-input v-model="selectedContainer.image"></el-input>
        </el-form-item>
        <el-form-item :label="t('common.pull-image-policy')" >
          <el-select
              default-first-option
              filterable
              allow-create
              v-model="selectedContainer.imagePullPolicy"
              placeholder="Select"
          >
            <el-option
                v-for="item in ['Never','Always','IfNotPresent']"
                :key="item"
                :label="item"
                :value="item"
            />
          </el-select>
        </el-form-item>
        <el-form-item class="none-box" :label="t('common.command')" >
          <el-row  v-for="(item,index) in selectedContainer.command" :key="index">
            <el-input style="width: 70vw"  @clear="selectedContainer.command.splice(index,1)"   v-model="selectedContainer.command[index]">
              <template #append>
                <el-button-group>
                  <el-button type="text" @click="selectedContainer.command.splice(index,1)">-</el-button>
                  <el-button type="text" @click="selectedContainer.command.splice(index+1,0,'')">+</el-button>
                </el-button-group>
              </template>
            </el-input>
          </el-row>
          <el-row v-if="selectedContainer.command===undefined || selectedContainer.command.length===0" style="width: 100%">
            <el-button style="width: 100%;"@click="selectedContainer.command=['']">{{ t('common.add-item') }}</el-button>
          </el-row>

        </el-form-item>
        <el-form-item :label="t('common.args')" >
          <el-row  v-for="(item,index) in selectedContainer.args" :key="index">
            <el-input style="width: 70vw"  @clear="selectedContainer.args.splice(index,1)"   v-model="selectedContainer.args[index]">
              <template #append>
                <el-button-group>
                  <el-button type="text" @click="selectedContainer.args.splice(index,1)">-</el-button>
                  <el-button type="text" @click="selectedContainer.args.splice(index+1,0,'')">+</el-button>
                </el-button-group>
              </template>
            </el-input>
          </el-row>
          <el-row v-if="selectedContainer.args===undefined || selectedContainer.args.length===0" style="width: 100%">
            <el-button style="width: 100%;"@click="selectedContainer.args=['']">{{ t('common.add-item') }}</el-button>
          </el-row>
        </el-form-item>
      </el-form>
    </el-row>

    <el-row>
      <el-text class="el-descriptions__title">{{ t('container-info-page.probe') }}</el-text>
    </el-row>
    <el-row >
      <div style="width: 80vw">
        <el-collapse accordion>
          <el-collapse-item :icon="CaretRight" v-for="(probe,probeIndex) in probes" :name="probe.key">
            <template #title>
              <el-check-tag class="round-box" checked :type="probe.tagType">{{ probe.name }}</el-check-tag>


              <div v-if="selectedContainer[probe.key]" class="ml-10 element-ml-2">
                <el-tag v-if="selectedContainer[probe.key].initialDelaySeconds" type="warning">{{ t('container-info-page.delay') }}: {{ selectedContainer[probe.key].initialDelaySeconds }}s</el-tag>
                <el-tag v-if="selectedContainer[probe.key].periodSeconds" type="primary">{{ t('container-info-page.period') }}: {{ selectedContainer[probe.key].periodSeconds }}s</el-tag>
                <el-tag v-if="selectedContainer[probe.key].timeoutSeconds" type="info">{{ t('container-info-page.timeout') }}: {{ selectedContainer[probe.key].timeoutSeconds }}s</el-tag>
                <el-tag v-if="selectedContainer[probe.key].successThreshold" type="success">{{ t('container-info-page.success') }}: {{ selectedContainer[probe.key].successThreshold }}</el-tag>
                <el-tag v-if="selectedContainer[probe.key].failureThreshold" type="danger">{{ t('container-info-page.failure') }}: {{ selectedContainer[probe.key].failureThreshold }}</el-tag>
                <el-tag v-if="selectedContainer[probe.key].exec" type="success"><el-icon><Clock /></el-icon>COMMAND</el-tag>
                <el-tag v-if="selectedContainer[probe.key].tcpSocket" type="success"><el-icon><Connection /></el-icon>TCP</el-tag>
                <el-tag v-if="selectedContainer[probe.key].httpGet" type="success"><el-icon><Connection /></el-icon>HTTP</el-tag>

              </div>


            </template>
            <el-divider content-position="left">{{ t('common.setting') }}</el-divider>

            <el-form v-if="selectedContainer[probe.key]" :model="selectedContainer" class="none-box mt-10" style="max-width: 1000px;min-width: 80vw" label-width="auto" label-position="left">

              <el-form-item :label="t('container-info-page.initial-delay-seconds')">
                <el-input clearable @clear="selectedContainer[probe.key].initialDelaySeconds = undefined" v-if="selectedContainer[probe.key].initialDelaySeconds !== undefined" type="number" v-model="selectedContainer[probe.key].initialDelaySeconds"></el-input>
                <el-button style="width: 100%;" v-else @click="selectedContainer[probe.key].initialDelaySeconds = 0">{{ t('common.add') }}</el-button>
              </el-form-item>
              <el-form-item :label="t('container-info-page.period-seconds')">
                <el-input clearable @clear="selectedContainer[probe.key].periodSeconds = undefined" v-if="selectedContainer[probe.key].periodSeconds !== undefined" type="number" v-model="selectedContainer[probe.key].periodSeconds"></el-input>
                <el-button style="width: 100%;" v-else @click="selectedContainer[probe.key].periodSeconds = 0">{{ t('common.add') }}</el-button>
              </el-form-item>
              <el-form-item :label="t('container-info-page.timeout-seconds')">
                <el-input clearable @clear="selectedContainer[probe.key].timeoutSeconds = undefined" v-if="selectedContainer[probe.key].timeoutSeconds !== undefined" type="number" v-model="selectedContainer[probe.key].timeoutSeconds"></el-input>
                <el-button style="width: 100%;" v-else @click="selectedContainer[probe.key].timeoutSeconds = 0">{{ t('common.add') }}</el-button>
              </el-form-item>
              <el-form-item :label="t('container-info-page.success-threshold')">
                <el-input clearable @clear="selectedContainer[probe.key].successThreshold = undefined" v-if="selectedContainer[probe.key].successThreshold !== undefined" type="number" v-model="selectedContainer[probe.key].successThreshold"></el-input>
                <el-button style="width: 100%;" v-else @click="selectedContainer[probe.key].successThreshold = 0">{{ t('common.add') }}</el-button>
              </el-form-item>
              <el-form-item :label="t('container-info-page.failure-threshold')">
                <el-input clearable @clear="selectedContainer[probe.key].failureThreshold = undefined" v-if="selectedContainer[probe.key].failureThreshold !== undefined" type="number" v-model="selectedContainer[probe.key].failureThreshold"></el-input>
                <el-button style="width: 100%;" v-else @click="selectedContainer[probe.key].failureThreshold = 0">{{ t('common.add') }}</el-button>
              </el-form-item>
              <el-divider content-position="left">{{ t('container-info-page.probe') }}</el-divider>

              <el-form-item label="Command" >
                <el-row v-if="selectedContainer[probe.key].exec!==undefined"  v-for="(item,index) in selectedContainer[probe.key].exec.command" :key="index">

                  <el-input style="width: 65vw"  @clear="selectedContainer[probe.key].exec.command.splice(index,1)"   v-model="selectedContainer[probe.key].exec.command[index]">
                    <template #append>
                      <el-button-group>
                        <el-button type="text" @click="selectedContainer[probe.key].exec.command.length <= 1? delete selectedContainer[probe.key].exec:selectedContainer[probe.key].exec.command.splice(index,1)">-</el-button>
                        <el-button type="text" @click="selectedContainer[probe.key].exec.command.splice(index+1,0,'')">+</el-button>
                      </el-button-group>
                    </template>
                  </el-input>
                </el-row>
                <el-row v-if="selectedContainer[probe.key].exec===undefined || selectedContainer[probe.key].exec.command.length===0"  style="width: 100%">
                  <el-button style="width: 100%;"@click="selectedContainer[probe.key].exec={command:['']}">{{ t('common.add-item') }}{{ t('container-info-page.command-probe') }}</el-button>
                </el-row>
              </el-form-item>

              <el-form-item label="HTTPGet" >
                <div v-if="selectedContainer[probe.key].httpGet !== undefined" style="width: 100%">
                  <el-form >
                    <el-form-item label="Path" >
                      <el-input placeholder="Path" clearable @clear="selectedContainer[probe.key].httpGet.path=undefined" v-if="selectedContainer[probe.key].httpGet.path !== undefined" v-model="selectedContainer[probe.key].httpGet.path"></el-input>
                      <el-button style="width: 100%;" v-else  @click="selectedContainer[probe.key].httpGet.path=''">{{ t('common.add') }}</el-button>
                    </el-form-item>
                    <el-form-item label="Port" >
                      <el-input placeholder="Port"  clearable   @change="selectedContainer[probe.key].httpGet.port=Number(selectedContainer[probe.key].httpGet.port)"  @clear="delete selectedContainer[probe.key].httpGet.port" v-if="selectedContainer[probe.key].httpGet.port !== undefined" v-model="selectedContainer[probe.key].httpGet.port"></el-input>
                      <el-button style="width: 100%;" v-else  @click="selectedContainer[probe.key].httpGet.port=''">{{ t('common.add') }}</el-button>
                    </el-form-item>

                  </el-form>
                  <el-button type="danger" plain  style="width: 100%;"  @click="delete selectedContainer[probe.key].httpGet">{{ t('common.delete')}}{{ t('container-info-page.http-probe') }}</el-button>
                </div>

                <el-button style="width: 100%;" v-else  @click="selectedContainer[probe.key].httpGet={}">{{ t('common.add') }}{{ t('container-info-page.http-probe') }}</el-button>

              </el-form-item>

              <el-form-item label="TCPSocket" >
                <div v-if="selectedContainer[probe.key].tcpSocket !== undefined" style="width: 100%">
                  <el-form >
                    <el-form-item label="Host" >
                      <el-input placeholder="Host" clearable @clear="selectedContainer[probe.key].tcpSocket.host=undefined" v-if="selectedContainer[probe.key].tcpSocket.host !== undefined" v-model="selectedContainer[probe.key].tcpSocket.host"></el-input>
                      <el-button style="width: 100%;" v-else  @click="selectedContainer[probe.key].tcpSocket.host=''">{{ t('common.add') }}</el-button>
                    </el-form-item>
                    <el-form-item label="Port" >
                      <el-input  @change="selectedContainer[probe.key].tcpSocket.port=Number(selectedContainer[probe.key].tcpSocket.port)" placeholder="Port"  clearable @clear="selectedContainer[probe.key].tcpSocket.port=undefined" v-if="selectedContainer[probe.key].tcpSocket.port !== undefined" v-model="selectedContainer[probe.key].tcpSocket.port"></el-input>
                      <el-button style="width: 100%;" v-else  @click="selectedContainer[probe.key].tcpSocket.port=''">{{ t('common.add') }}</el-button>
                    </el-form-item>

                  </el-form>
                  <el-button type="danger" plain style="width: 100%;"  @click="delete selectedContainer[probe.key].tcpSocket">{{ t('common.delete')}}{{ t('container-info-page.tcp-probe') }}</el-button>
                </div>

                <el-button style="width: 100%;" v-else  @click="selectedContainer[probe.key].tcpSocket={}">{{ t('common.add') }}{{ t('container-info-page.tcp-probe') }}</el-button>

              </el-form-item>



            </el-form>


            <el-button type="danger" plain  v-if="selectedContainer[probe.key] !== undefined" style="width: 100%;" @click="delete selectedContainer[probe.key]">{{ t('common.delete') }}Probe</el-button>
            <el-button style="width: 100%;" v-else @click="selectedContainer[probe.key]={}">{{ t('common.add') }}Probe</el-button>

          </el-collapse-item>


        </el-collapse>
      </div>
    </el-row>

    <el-row>
      <el-text class="el-descriptions__title">{{ t('common.env-vars') }}</el-text>
    </el-row>
    <el-row style="width: 80vw">
      <el-table class="none-box" style="margin-top: 10px" :data="selectedContainer.env" >

        <el-table-column sortable prop="name" :label="t('common.key')" width="240">
          <template #default="scope">
            <el-input v-model="scope.row.name"  />

          </template>
        </el-table-column>


        <el-table-column sortable prop="data" :label="t('common.value')" >
          <template #default="scope">
            <el-input v-model="scope.row.value"  />
          </template>
        </el-table-column>

        <el-table-column  :label="t('common.operation')" width="280">
          <template #default="scope">

            <el-button size="small" type="danger" plain @click="handleDeleteContainerEnvItem(selectedContainer.env,scope.$index)">{{ t('common.delete') }}
            </el-button>

          </template>
        </el-table-column>


      </el-table>
    </el-row>
    <el-row>
      <el-button style="width: 80vw" @click="handleAddContainerEnvItem(selectedContainer)">{{ t('common.add-item') }}</el-button>
    </el-row>

  </el-scrollbar>




</template>

<script setup>
import {ref} from "vue";
import { useI18n } from 'vue-i18n'
import {CaretRight} from "@element-plus/icons-vue";
const { t } = useI18n()
// const props = defineProps({
//   containers: {
//     type: Array,
//     default: ()=>[]
//   }
//
// })
// 'startupProbe','livenessProbe','readinessProbe'
const containers = defineModel('containers')
const probes = ref([
  {
    'key':'startupProbe',
    'name': t('container-info-page.startup-probe'),
    'tagType':'success'
  },
  {
    'key':'livenessProbe',
    'name': t('container-info-page.liveness-probe'),
    'tagType':'warning'
  },
  {
    'key':'readinessProbe',
    'name': t('container-info-page.readiness-probe'),
    'tagType':'primary'
  }
])
const selectedContainerName = ref('')
const selectedContainer = ref({})
// watch(props.containers, (newContainers)=>{
//   selectedContainerName.value = newContainers[0].name
//   selectedContainer.value = newContainers[0]
// })

onMounted(()=>{
  selectedContainerName.value = containers.value[0].name
  selectedContainer.value = containers.value[0]
})

watch([selectedContainerName,containers], ([newSelectedContainerName,newContainers])=>{
  if(newSelectedContainerName){
    selectedContainer.value = newContainers.find(item => item.name === newSelectedContainerName)
  }else{
    selectedContainer.value = newContainers[0]
  }
})

const handleAddContainerEnvItem = (container) => {
  if(!container.env){
    container.env = []
  }
  container.env.push({
    name: 'k',
    value: 'v',
  })
}

const handleDeleteContainerEnvItem = (containerEnvList,index) => {
  containerEnvList.splice(index,1)
}


</script>

<style scoped>
.element-ml-2 .el-tag{
  margin-left: 2px;
}
.custom-style .el-row{
  padding-top: 10px;
}
.round-box{
  border-radius: 3px;
}
</style>