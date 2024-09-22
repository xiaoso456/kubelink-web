<template>


  <el-row>
    <el-radio-group v-model="selectedContainerName" >
      <el-radio-button v-for="container in containers" :label="container.name" :value="container.name" />
    </el-radio-group>
  </el-row>
  <el-row>
    <el-text class="el-descriptions__title">{{ t('app-details-page.base-info') }}</el-text>
  </el-row>

  <el-row>
    <el-form :model="selectedContainer" class="none-box" style="max-width: 1000px;min-width: 80vw" label-width="auto" label-position="left">
      <el-form-item label="Image" >
        <el-input v-model="selectedContainer.image"></el-input>
      </el-form-item>
      <el-form-item label="ImagePullPolicy" >
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
      <el-form-item class="none-box" label="Command" >
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
      <el-form-item label="Args" >
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
    <el-text class="el-descriptions__title">Probe</el-text>
  </el-row>
  <el-row >
    <div style="width: 80vw">
      <el-collapse accordion>
        <el-collapse-item name="Startup Probe">
          <template #title>
            Startup Probe
            <div v-if="selectedContainer.startupProbe" class="ml-10 element-ml-2">
              <el-tag type="warning">Delay: {{selectedContainer.startupProbe.initialDelaySeconds}}s</el-tag>
              <el-tag type="primary">Period: {{selectedContainer.startupProbe.periodSeconds}}s</el-tag>
              <el-tag type="info">Timeout: {{selectedContainer.startupProbe.timeoutSeconds}}s</el-tag>
              <el-tag type="success">Success: {{selectedContainer.startupProbe.successThreshold}}</el-tag>
              <el-tag type="danger">Failure: {{selectedContainer.startupProbe.failureThreshold}}</el-tag>
            </div>

          </template>

          <el-form v-if="selectedContainer.startupProbe" :model="selectedContainer" class="none-box" style="max-width: 1000px;min-width: 80vw" label-width="auto" label-position="left">
            <el-form-item label="InitialDelaySeconds" >
              <el-input clearable @clear="selectedContainer.startupProbe.initialDelaySeconds=undefined" v-if="selectedContainer.startupProbe.initialDelaySeconds !== undefined" type="number" v-model="selectedContainer.startupProbe.initialDelaySeconds"></el-input>
              <el-button v-else  @click="selectedContainer.startupProbe.initialDelaySeconds=0">{{ t('common.add') }}</el-button>
            </el-form-item>
            <el-form-item label="PeriodSeconds" >
              <el-input clearable @clear="selectedContainer.startupProbe.periodSeconds=undefined" v-if="selectedContainer.startupProbe.periodSeconds !== undefined" type="number" v-model="selectedContainer.startupProbe.periodSeconds"></el-input>
              <el-button v-else  @click="selectedContainer.startupProbe.periodSeconds=0">{{ t('common.add') }}</el-button>
            </el-form-item>
            <el-form-item label="TimeoutSeconds" >
              <el-input clearable @clear="selectedContainer.startupProbe.timeoutSeconds=undefined" v-if="selectedContainer.startupProbe.timeoutSeconds !== undefined" type="number" v-model="selectedContainer.startupProbe.timeoutSeconds"></el-input>
              <el-button v-else  @click="selectedContainer.startupProbe.timeoutSeconds=0">{{ t('common.add') }}</el-button>
            </el-form-item>
            <el-form-item label="SuccessThreshold" >
              <el-input clearable @clear="selectedContainer.startupProbe.successThreshold=undefined" v-if="selectedContainer.startupProbe.successThreshold !== undefined" type="number" v-model="selectedContainer.startupProbe.successThreshold"></el-input>
              <el-button v-else  @click="selectedContainer.startupProbe.successThreshold=0">{{ t('common.add') }}</el-button>
            </el-form-item>
            <el-form-item label="FailureThreshold" >
              <el-input clearable @clear="selectedContainer.startupProbe.failureThreshold=undefined" v-if="selectedContainer.startupProbe.failureThreshold !== undefined" type="number" v-model="selectedContainer.startupProbe.failureThreshold"></el-input>
              <el-button v-else  @click="selectedContainer.startupProbe.failureThreshold=0">{{ t('common.add') }}</el-button>
            </el-form-item>

            <el-form-item label="Command" >
              <el-row v-if="selectedContainer.startupProbe.exec!==undefined"  v-for="(item,index) in selectedContainer.startupProbe.exec.command" :key="index">

                <el-input style="width: 65vw"  @clear="selectedContainer.startupProbe.exec.command.splice(index,1)"   v-model="selectedContainer.startupProbe.exec.command[index]">
                  <template #append>
                    <el-button-group>
                      <el-button type="text" @click="selectedContainer.startupProbe.exec.command.splice(index,1)">-</el-button>
                      <el-button type="text" @click="selectedContainer.startupProbe.exec.command.splice(index+1,0,'')">+</el-button>
                    </el-button-group>
                  </template>
                </el-input>
              </el-row>
              <el-row v-if="selectedContainer.startupProbe.exec===undefined || selectedContainer.startupProbe.exec.command.length===0"  style="width: 100%">
                <el-button style="width: 100%;"@click="selectedContainer.startupProbe.exec={command:['']}">{{ t('common.add-item') }}</el-button>
              </el-row>
            </el-form-item>

          </el-form>
          <el-button style="width: 100%;" v-if="selectedContainer.startupProbe === undefined" @click="selectedContainer.startupProbe={}">{{ t('common.add') }}</el-button>

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
<!--  <el-row style="max-width: 80vw" class="row-bg" justify="end">-->
<!--    <el-button size="default" type="info" plain @click="handleCancelSaveAppJson">{{ t('common.cancel') }}</el-button>-->
<!--    <el-button size="default" type="success" plain @click="saveAppJson">{{ t('common.save') }}</el-button>-->
<!--  </el-row>-->

</template>

<script setup>
import {ref} from "vue";
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
const props = defineProps({
  containers: {
    type: Array,
    default: ()=>[]
  }

})

const selectedContainerName = ref('')
const selectedContainer = ref({})
// watch(props.containers, (newContainers)=>{
//   selectedContainerName.value = newContainers[0].name
//   selectedContainer.value = newContainers[0]
// })

onMounted(()=>{
  selectedContainerName.value = props.containers[0].name
  selectedContainer.value = props.containers[0]
})

watch([selectedContainerName,props.containers], ([newSelectedContainerName,newContainers])=>{
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

</style>