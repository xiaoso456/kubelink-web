<template>
<!--    <div   style="width: 600px;height: 600px;border-style: solid;border-width: 1px;">-->
    <div  v-shortkey="{right:['arrowright'],left:['arrowleft']}" @shortkey="handleArrow" style="margin-left: 10px;margin-right: 10px;" >

      <el-segmented @change="handleSelectOption"  v-model="selectedOptionValue" :options="operationTypeOptions"  >
        <template #default="{ item }">
          <div  style="min-width: 100px;margin: 5px 0 5px 0" class="flex flex-col items-center gap-2 p-2">
            <el-icon size="20">
              <component :is="item.icon" />
            </el-icon>
            <div>{{ item.label }}</div>
          </div>
        </template>
      </el-segmented>
      <el-row align="middle">

          <el-descriptions  style="margin-top: 10px;width: 70%"  border size="default" :column="4">

            <el-descriptions-item  label="Namespace">{{ route.params.namespace }}</el-descriptions-item>
            <el-descriptions-item  label="Pod">{{ route.params.pod }}</el-descriptions-item>
            <el-descriptions-item  label="Container">{{ route.params.container }}</el-descriptions-item>

          </el-descriptions>

      </el-row>
      <el-row style="margin-top: 10px" :gutter="8">
        <el-col :span="10" style="min-width: 480px">
          <el-input
              v-model="searchInput"
              placeholder="Please input"
              @keyup.enter="highlightKeyword"
              clearable
          >
            <template #prepend>
              <el-button @click="highlightKeyword" :icon="Search" ></el-button>
            </template>
            <template #append >

              <el-tooltip
                  class="box-item"
                  :content="highlightContent"
                  placement="top-start"
              >
                <el-text  :type="searchCount===highlightLimit?'danger':'info'">{{searchIndex + 1}}/{{searchCount }}</el-text>
              </el-tooltip>

              <el-divider direction="vertical" />
              <el-button-group class="ml-4">
                <el-button size="small" @click="searchPrev" style="margin: 0;padding: 4px" :bg="true" plain text><el-icon><ArrowUpBold /></el-icon></el-button>
                <el-button size="small"  @click="searchNext"  style="margin: 0;padding: 4px" :bg="true" plain text><el-icon><ArrowDownBold /></el-icon></el-button>

              </el-button-group>

            </template>
          </el-input>
        </el-col>


        <el-col :span="3"  style="min-width: 160px" v-show="['Logs','PreviousLogs'].includes(selectedOptionValue)">
          <el-tooltip  effect="light" content="tail lines">
            <el-input-number  style="width: 100%" v-model="tailLines" :min="1" :step="5000" />
          </el-tooltip>

        </el-col>

        <el-col :span="6"  style="min-width: 200px">

          <el-button v-show="['Logs','PreviousLogs'].includes(selectedOptionValue)"  @click="updateTermLog()"  plain type="primary" >Refresh</el-button>
          <el-button @click="downloadTermLog()"  plain type="success" >Download</el-button>

        </el-col>

      </el-row>

      <el-scrollbar v-show="selectedOptionValue==='Logs'" height="67vh" >
        <div  id="terminalLog" class="terminal"/>

      </el-scrollbar>
      <el-scrollbar v-show="selectedOptionValue==='PreviousLogs'" height="67vh" >
        <div v-show="selectedOptionValue==='PreviousLogs'" id="terminalPreLog" class="terminal"/>

      </el-scrollbar>
      <div v-show="selectedOptionValue==='Console'" class="none-box">
        <el-row  :gutter="20" >
          <el-col :span="16">
            <div  id="terminalConsole"  class="terminal"/>
          </el-col>
          <el-col :span="8">
            <el-form :model="templateForm" label-width="auto" style="max-width: 600px">
              <el-form-item label="Type">
                <el-select
                    @click="refreshTextTemplateTypeList"
                    @change="refreshTextTemplateList"
                    v-model="selectedTemplateTypeOptionValue"
                    placeholder="All"
                    default-first-option
                    filterable
                    allow-create
                    clearable
                >
                  <el-option
                      v-for="item in templateTypeOptions"
                      :key="item"
                      :label="item"
                      :value="item"
                  />

                </el-select>

              </el-form-item>
              <el-form-item label="Name">
                <el-select
                    @click="refreshTextTemplateList"
                    v-model="selectedTemplateId"
                    @change="handleSelectedTemplate"
                    placeholder="All"
                    default-first-option
                    filterable
                    allow-create
                    clearable
                >
                  <el-option
                      v-for="item in templateListRaw"
                      :key="item.id"
                      :label="item.name"
                      :value="item.id"
                  />

                </el-select>
              </el-form-item>
              <el-divider  content-position="left" >Vars</el-divider>
              <el-table :data="selectedTemplateVarsTableData" >
                <el-table-column prop="key" label="Key" >

                </el-table-column>


                <el-table-column prop="value" label="Value">
                  <template #default="scope" >
                    <el-input ref="focusRef"  v-model="selectedTemplateItem.templateVariables[scope.row.key]"></el-input>
                  </template>
                </el-table-column>

              </el-table>

              <el-divider  content-position="left" >Preview</el-divider>
              <el-input  v-model="templateContentPreview" autosize type="textarea" />
              <el-row style="margin-top: 10px" justify="end">
                <el-button @click="socket.send(templateContentPreview)">execute</el-button>
              </el-row>
            </el-form>
          </el-col>
        </el-row>

      </div>

    </div>



</template>

<script setup>
import {Terminal} from "xterm";
import {FitAddon} from '@xterm/addon-fit';
import {Memo, Monitor, Postcard, Search} from "@element-plus/icons-vue";
import {useRoute, useRouter} from "vue-router";
import {apiPodGet, apiPodLogs} from "@/services/pod.js";
import {SearchAddon} from "@xterm/addon-search";
import {createWS} from "@/services/ws.js";
import {AttachAddon} from "@xterm/addon-attach";
import {ref} from "vue";
import {apiTextTemplateList, apiTextTemplateTypeList} from "@/services/textTemplate.js";
import Handlebars from "handlebars";

const selectedOptionValue = ref('Logs')
const operationTypeOptions = [
  {
    label: 'Logs',
    value: 'Logs',
    icon: Postcard,
  },
  {
    label: 'PreviousLogs',
    value: 'PreviousLogs',
    icon: Memo,
  },
  {
    label: 'Console',
    value: 'Console',
    icon: Monitor,
  },
  // {
  //   label: 'Attach',
  //   value: 'Attach',
  //   icon: Coin,
  // },
  // {
  //   label: 'Command',
  //   value: 'Command',
  //   icon: Reading,
  // }
]

const templateTypeOptions = ref([])
const selectedTemplateTypeOptionValue = ref('command')

const searchInput = ref('')
const searchIndex = ref(0)
const searchCount = ref(0)
const tailLines = ref(5000)
const route = useRoute()
const router = useRouter()
const highlightLimit = ref(1000)
const highlightContent = computed(()=>{
  return "highlight limit: " + highlightLimit.value
})

const selectState = ref({
  Logs:{
    terminal: null,
    searchAddon: null,
    fitAddon: null,
  },
  PreviousLogs:{
    terminal: null,
    searchAddon: null,
    fitAddon: null,

  },
  Console:{
    terminal: null,
    searchAddon: null,
    fitAddon: null,

  }
})
// const isFitting = ref(false)
window.onresize = async () => {
  // if(!isFitting.value) {
  //   isFitting.value = true
  //   await allFit()
  //   isFitting.value = false
  // }

}

const templateForm = ref( {
  id: '1',
  name: 'name',
  content: 'content',
  type: 'command',
  description: 'description',
  version: 1,
  templateVariables: {
    key1: 'value1'
  }
})



const templateListRaw = ref([
  {
    id: '1',
    name: 'name',
    content: 'content',
    type: 'command',
    description: 'description',
    version: 1,
    templateVariables: {
      key: 'value'
    }
  }
])

const selectedTemplateId = ref(null)
const selectedTemplateItem = ref(null)
const selectedTemplateVarsTableData = ref([])
const templateContentPreview = ref('')

const allFit = () => {
  for (const key in selectState.value) {
    if(key !== route.params.action){
      continue
    }
    if (selectState.value.hasOwnProperty(key)) {
      if(selectState.value[key].fitAddon != null){
        selectState.value[key].fitAddon.fit()
      }
    }
  }
}
const searchPrev = ()=>{
  const searchAddon = selectState.value[route.params.action].searchAddon
  searchAddon.findPrevious(searchInput.value,findOption)
}
const searchNext = ()=>{
  const searchAddon = selectState.value[route.params.action].searchAddon
  searchAddon.findNext(searchInput.value,findOption)
}

const handleArrow = (event) =>{
  switch (event.srcKey) {
    case "right":
      searchNext()
      break;
    case "left":
      searchPrev()
      break;
  }
}


const addAddonToTerm = (term,stateName) => {
  const fitAddon = new FitAddon();
  const searchAddon = new SearchAddon({
    highlightLimit: highlightLimit.value,
  });
  searchAddon.onDidChangeResults((item)=>{
    searchIndex.value = item.resultIndex
    searchCount.value = item.resultCount
  })
  term.loadAddon(fitAddon);
  term.loadAddon(searchAddon);
  selectState.value[stateName].searchAddon = searchAddon
  selectState.value[stateName].fitAddon = fitAddon
  selectState.value[stateName].terminal = term
  setTimeout(()=>{
    fitAddon.fit()
  },1000)


}

const termLog = new Terminal({
  theme: {
    background: '#000000',
    foreground: '#ffffff',
  },
  rows: 100,

  screenReaderMode: false,
  disableStdin: true,
  convertEol: true,
  allowProposedApi: true,
  scrollback: Number.MAX_SAFE_INTEGER


});
addAddonToTerm(termLog,'Logs')

const terminalPreLog = new Terminal({
  theme: {
    background: '#000000',
    foreground: '#ffffff',
  },
  rows: 100,
  screenReaderMode: false,
  disableStdin: true,
  convertEol: true,
  allowProposedApi: true,
  scrollback: Number.MAX_SAFE_INTEGER

});
addAddonToTerm(terminalPreLog,'PreviousLogs')

const terminalConsole = new Terminal({
  theme: {
    background: '#000000',
    foreground: '#ffffff',
  },
  rows: 100,
  screenReaderMode: false,
  disableStdin: false,
  convertEol: true,
  allowProposedApi: true,
  scrollback: Number.MAX_SAFE_INTEGER
});
addAddonToTerm(terminalConsole,'Console')






const updateTermLog = ()=>{
  if(route.params.action === 'Logs'){
    termLog.clear()
    apiPodLogs(route.params.namespace,route.params.pod,route.params.container,false,tailLines.value).then(async res => {
      const resData = await res.text()
      updateTermText(termLog,resData)

    }).catch(err => {
      ElMessage({
        message: "request error: " + err,
        type: 'error'
      })
      console.log(err)
    })
  }else if(route.params.action === 'PreviousLogs'){
    terminalPreLog.clear()
    apiPodLogs(route.params.namespace,route.params.pod,route.params.container,true,tailLines.value).then(async res => {
      const resData = await res.text()
      updateTermText(terminalPreLog,resData)

    }).catch(err => {
      ElMessage({
        message: "request error: " + err,
        type: 'error'
      })
      console.log(err)
    })
  }

}

const downloadTermLog = async () => {


  let downloadText = ""
  let wait;
  if (route.params.action === 'Logs') {
    // use api
    wait = apiPodLogs(route.params.namespace, route.params.pod, route.params.container, false, tailLines.value).then(async res => {
      downloadText = await res.text()
    }).catch(err => {
      ElMessage({
        message: "request error: " + err,
        type: 'error'
      })
      console.log(err)
    })
  } else if (route.params.action === 'PreviousLogs') {
    wait = apiPodLogs(route.params.namespace, route.params.pod, route.params.container, true, tailLines.value).then(async res => {
      downloadText = await res.text()
    }).catch(err => {
      ElMessage({
        message: "request error: " + err,
        type: 'error'
      })
      console.log(err)
    })
  } else if (route.params.action === 'Console') {
    for (let i = 0; i < terminalConsole.buffer.active.length; i++) {
      downloadText += terminalConsole.buffer.active.getLine(i).translateToString() + '\n'
    }
  }
  if (wait) {
    await wait
  }


  const blob = new Blob([downloadText], {type: 'text/plain'});
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${route.params.namespace}-${route.params.pod}-${route.params.container}-${route.params.action}.log`; // 设置下载的文件名
  document.body.appendChild(link);
  link.click();
  URL.revokeObjectURL(url);
  document.body.removeChild(link);


}

const updateTermText = async (terminal, text) => {
  await terminal.write(text)
  await allFit()
}
const findOption = {
  caseSensitive: false,
  decorations:{
    // activeMatchBackground: '#1cb263',
    // activeMatchBorder: '#1cb263',
    // matchBackground: '#3987e0',
    matchBorder: '#3987e0',
    incremental: true
  }
}
const highlightKeyword = () => {
  const searchAddon = selectState.value[route.params.action].searchAddon

  searchAddon.findNext(searchInput.value,findOption)
}
const socket = ref(null);
const handleSelectOption = async () => {

  route.params.action = selectedOptionValue.value
  if (selectedOptionValue.value === 'Logs') {
    termLog.clear()

  } else if (selectedOptionValue.value === 'PreviousLogs') {
    terminalPreLog.clear()
    // router.push(`/pod/namespace/${route.params.namespace}/pod/${route.params.pod}/container/${route.params.container}/PreviousLogs`)
  } else if (selectedOptionValue.value === 'Console') {
    if (!socket.value) {
      socket.value = createWS(`/ws/namespace/${route.params.namespace}/pod/${route.params.pod}/container/${route.params.container}/exec`);
      const attachAddon = new AttachAddon(socket.value);
      terminalConsole.loadAddon(attachAddon);
    }
  }
  await updateTermLog()
  await highlightKeyword()

  // router.push(`/pod/namespace/${route.params.namespace}/pod/${route.params.pod}/container/${route.params.container}/${selectedOptionValue.value}`)
  // setTimeout(()=>{
  //   window.location.reload()
  // },50)
}


const refreshTextTemplateTypeList = () => {
  apiTextTemplateTypeList().then(async res => {
    const status = res.status
    if(status === 200){
      templateTypeOptions.value = await res.json()
    }else{
      ElMessage({
        message: "request for template type error",
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

const refreshTextTemplateList = () => {
  apiTextTemplateList(searchInput.value,selectedTemplateTypeOptionValue.value).then(async res => {
    const status = res.status
    if(status === 200){
      templateListRaw.value = await res.json()
    }

  }).catch(err =>{
    ElMessage({
      message: "request error: " + err,
      type:'error'
    })
    console.log(err)
  })
}

const handleSelectedTemplate = (templateId) =>{
  selectedTemplateItem.value = templateListRaw.value.find(item => item.id === templateId)
  selectedTemplateVarsTableData.value = Object.keys(selectedTemplateItem.value.templateVariables).map(key => {
    return {
      key: key,
      value: selectedTemplateItem.value.templateVariables[key]
    }
  })
}
watch(selectedTemplateItem,()=>{
  if(! selectedTemplateItem.value){
    return ''
  }
  const template = Handlebars.compile(selectedTemplateItem.value.content)
  try {
    templateContentPreview.value =  template(selectedTemplateItem.value.templateVariables)

  }catch (error){
    templateContentPreview.value = error
  }
},{
  deep:true
})




onMounted(() => {


  selectedOptionValue.value = route.params.action

  termLog.open(document.getElementById('terminalLog'));

  terminalPreLog.open(document.getElementById('terminalPreLog'));

  terminalConsole.open(document.getElementById('terminalConsole'));

  handleSelectOption()

  refreshTextTemplateTypeList()
  // updatePodInfo()



})
</script>

<style lang="scss" scoped>
.terminal {
  margin-top:10px;
  max-height: 65vh;

}


::v-deep(.el-input-group__append){
  padding: 0 10px 0 15px;
}

::v-deep(.xterm-find-active-result-decoration){
  //outline: #1cb263 solid 2px !important;
  background: #3987e0;
  z-index: 1!important;
}
</style>