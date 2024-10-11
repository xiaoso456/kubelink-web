
<template>
  <div class="ml-10 none-box">

    <el-steps style="max-width: 600px" class="mb-4" :space="200" :active="stepActive" finish-status="success" simple >
      <el-step :title="t('add-resource-page.base-info')" />
      <el-step :title="t('common.preview')" />
    </el-steps>

    <el-scrollbar  max-height="75vh"  style="max-width:80vw;margin-top: 10px">
      <div v-if="stepActive===1">
        <el-form ref="resourceFormRef" :model="resourceInfo" label-width="auto" style="max-width: 80vw;" :rules="resourceInfoRule">
          <el-form-item :label="t('add-resource-page.kind')" prop="kind">
            <el-radio-group v-model="resourceInfo.kind">
              <el-radio value="Deployment">Deployment</el-radio>
              <el-radio value="Statefulset">Statefulset</el-radio>
              <el-radio value="Daemonset">Daemonset</el-radio>
              <el-radio value="Service">Service</el-radio>

            </el-radio-group>
          </el-form-item>

          <el-form-item :label="t('add-resource-page.namespace')" prop="namespace">
            <el-select v-model="resourceInfo.namespace"
                       default-first-option
                       filterable
                      >
              <el-option
                  v-for="item in namespaceOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item :label="t('common.name')" prop="name">
            <el-input v-model="resourceInfo.name" />
          </el-form-item>


          <!-- 动态添加 selector 的部分 -->
          <el-form-item :label="t('add-resource-page.selector')" v-if="resourceInfo.kind === 'Service'">
            <el-table :data="resourceInfo.selector" style="width: 100%">
              <el-table-column prop="key" label="Key" width="180">
                <template #default="{ row }">
                  <el-input v-model="row.key" size="small" />
                </template>
              </el-table-column>
              <el-table-column prop="value" label="Value" width="180">
                <template #default="{ row }">
                  <el-input v-model="row.value" size="small" />
                </template>
              </el-table-column>
              <el-table-column :label="t('common.operation')" >
                <template #default="{ row, $index }">
                  <el-button type="danger" size="small" @click="removeSelector($index)">{{ t('common.delete') }}</el-button>
                </template>
              </el-table-column>
            </el-table>
            <el-button style="width: 100%" class="mt-10" size="small" @click="addSelector">{{ t('common.add') }} </el-button>
          </el-form-item>

          <el-form-item v-show="resourceInfo.kind !== 'Service'" :label="t('common.image')">
            <el-input v-model="resourceInfo.image" />
          </el-form-item>
          <el-form-item v-show="resourceInfo.kind === 'Service'" :label="t('common.type')">
            <el-select v-model="resourceInfo.serviceType" placeholder="Select" >
              <el-option
                  v-for="item in ['ClusterIP','NodePort','LoadBalancer']"
                  :key="item"
                  :label="item"
                  :value="item"
              />
            </el-select>
          </el-form-item>
          <el-form-item :label="t('add-resource-page.ports')" v-if="resourceInfo.kind === 'Service'">
            <el-table :data="resourceInfo.ports" style="width: 100%">
              <el-table-column prop="name" label="Name" width="180">
                <template #default="{ row }">
                  <el-input v-model="row.name" size="small" />
                </template>
              </el-table-column>

              <el-table-column prop="protocol" label="Protocol" width="180">
                <template #default="{ row }">
                  <el-select v-model="row.protocol" placeholder="Select"  size="small">
                    <el-option
                        v-for="item in ['TCP','UDP']"
                        :key="item"
                        :label="item"
                        :value="item"
                    />
                  </el-select>
                </template>
              </el-table-column>
              <el-table-column prop="port" label="Port" width="180">
                <template #default="{ row }">
                  <el-input v-model="row.port" size="small" />
                </template>
              </el-table-column>
              <el-table-column prop="targetPort" label="Target Port" width="180">
                <template #default="{ row }">
                  <el-input v-model="row.targetPort" size="small" />
                </template>
              </el-table-column>

              <el-table-column :label="t('common.operation')" >
                <template #default="{ row, $index }">
                  <el-button type="danger" size="small" @click="removePort($index)">{{ t('common.delete') }}</el-button>
                </template>
              </el-table-column>
            </el-table>
            <el-button style="width: 100%" class="mt-10" size="small" @click="addPort">{{ t('common.add') }}</el-button>
          </el-form-item>

        </el-form>
      </div>
      <div v-if="stepActive===2">

        <el-scrollbar style="max-width:80vw;margin-top: 10px">

          <codemirror

              v-model="jsonCode"
              placeholder="Code goes here..."
              :autofocus="true"
              :indent-with-tab="true"
              :tab-size="2"
              :extensions="codeExtensions"
          />
        </el-scrollbar>
      </div>

    </el-scrollbar>
    <el-row style="max-width: 80vw" class="row-bg mt-10" justify="end">
      <el-button v-show="stepActive!==1" @click="preStep">{{ t('add-resource-page.pre-step') }}</el-button>
      <el-button v-show="stepActive!==steps.length" @click="nextStep(resourceFormRef)">{{ t('add-resource-page.next-step') }}</el-button>
      <el-button v-show="stepActive===steps.length" size="default" type="success" plain @click="createApp">{{ t('common.create') }}</el-button>
    </el-row>

  </div>

</template>

<script setup>
import { ref } from 'vue'
import {Codemirror} from "vue-codemirror";
import {
  daemonsetJsonTemplateReader,
  deploymentJsonTemplateReader, serviceJsonTemplateReader,
  statefulsetJsonTemplateReader
} from "@/template/resourceTemplate.js";
import {useDark,useToggle} from "@vueuse/core";
import {json} from "@codemirror/lang-json";
import {oneDark} from "@codemirror/theme-one-dark";
import {apiDeploymentCreate, apiDeploymentGet, apiDeploymentYamlUpdate} from "@/services/deployment.js";
import {apiStatefulsetCreate, apiStatefulsetYamlUpdate} from "@/services/statefulset.js";
import {apiDaemonsetCreate, apiDaemonsetYamlUpdate} from "@/services/daemonset.js";
import {apiJobYamlUpdate} from "@/services/job.js";
import { useI18n } from 'vue-i18n'
import {apiNamespaceList} from "@/services/namespace.js";
import {apiServiceCreate} from "@/services/service.js";
const { t } = useI18n()

const resourceFormRef = ref()

const steps = ref([
  {
    title:t('add-resource-page.base-info')
  },
  {
    title:t('common.preview')
  }
])

const stepActive = ref(1)

const nextStep = async (formRef) => {
  if (!formRef) return
  await formRef.validate((valid, fields) => {
    if (valid) {
      if (stepActive.value < steps.value.length) {
        stepActive.value++
      }
    } else {
      console.log('error submit!', fields)
    }
  })


}
const preStep = () => {
  if(stepActive.value > 1){
    stepActive.value--
  }
}

const resourceInfo = ref({
  name: '',
  namespace: '',
  kind: 'Deployment',
  image: '',
  serviceType: 'ClusterIP',
  selector: [], // item: { key: '', value: '' }
  ports: [{ port: '', targetPort: '',protocol:'' }]
})

const resourceInfoRule = {
  name: [{ required: true, message: 'Name is required', trigger: 'blur' }],
  namespace: [{ required: true, message: 'Namespace is required', trigger: 'blur' }],
}

const jsonCodeRaw = ref('')
const jsonCode = ref('')
watch(resourceInfo, (newValue, oldValue) => {
  if(newValue.kind === 'Deployment'){
    jsonCode.value = deploymentJsonTemplateReader(newValue)
  }else if(newValue.kind === 'Statefulset'){
    jsonCode.value = statefulsetJsonTemplateReader(newValue)
  }else if(newValue.kind === 'Daemonset'){
    jsonCode.value = daemonsetJsonTemplateReader(newValue)
  }else if(newValue.kind === 'Service'){
    jsonCode.value = serviceJsonTemplateReader(newValue)
  }
  jsonCodeRaw.value = jsonCode.value

}, {deep: true})

const isDark = useDark({
  storageKey: 'vue-theme-mode',
  valueDark: 'dark',
  valueLight: 'light',
})



const codeExtensions = ref([
  json(),
  oneDark,
])
watch(isDark, (isDarkValue) => {
  if(isDarkValue){
    codeExtensions.value = [
      json(),
      oneDark,
    ]
  }else{
    codeExtensions.value = [
      json(),
    ]
  }
})

const namespaceOptions = ref([
  {
    label: 'Namespace1',
    value: 'Namespace1',
  }
])
const refreshNamespaceOptions = () => {
  apiNamespaceList().then(async res => {
    const resData = await res.json()
    namespaceOptions.value = resData.map(item => {
      return {
        value: item.metadata.name,
        label: item.metadata.name
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

onMounted(() => {
  jsonCode.value = deploymentJsonTemplateReader(resourceInfo.value)
  jsonCodeRaw.value = jsonCode.value
  refreshNamespaceOptions()

})


const createApp = () => {
  let apiAppCreate = null;
  if(resourceInfo.value.kind === 'Deployment'){
    apiAppCreate = apiDeploymentCreate
  }else if(resourceInfo.value.kind === 'Statefulset'){
    apiAppCreate = apiStatefulsetCreate
  }else if(resourceInfo.value.kind === 'Daemonset'){
    apiAppCreate = apiDaemonsetCreate
  }else if(resourceInfo.value.kind === 'Service'){
    apiAppCreate = apiServiceCreate
  }
  if(apiAppCreate !== null){
    apiAppCreate(resourceInfo.value.namespace,jsonCode.value).then(async res => {
      const resData = await res.json()
      ElMessage({
        message: `Create ${resData.metadata.name} successfully`,
        type: 'success'
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

const addPort = () => {
  resourceInfo.value.ports.push({ port: '', targetPort: '',name: '' });
}

const removePort = (index) => {
  resourceInfo.value.ports.splice(index, 1);
}





const addSelector = () => {
  resourceInfo.value.selector.push({ key: '', value: '' });
};

const removeSelector = index => {
  resourceInfo.value.selector.splice(index, 1);
};
</script>


<style scoped>

</style>