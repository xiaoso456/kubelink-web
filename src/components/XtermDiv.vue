<template>
<!--    <div   style="width: 600px;height: 600px;border-style: solid;border-width: 1px;">-->
    <div  style="margin-left: 10px;margin-right: 10px;" >

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
      <el-row style="margin-top: 10px" :gutter="10">
        <el-col :span="8">
          <el-input
              v-model="searchInput"
              style="max-width: 100%"
              placeholder="Please input"
              class="input-with-select"
              @input="highlightKeyword"
              clearable
          >
            <template #prepend>
              <el-button @click="highlightKeyword" :icon="Search" ></el-button>
            </template>
            <template #append>
              <el-text>Total:{{ searchCount }}</el-text>

            </template>
          </el-input>
        </el-col>
        <el-col :span="3" v-show="['Logs','PreviousLogs'].includes(selectedOptionValue)">
          <el-tooltip  effect="light" content="tail lines">
            <el-input-number  style="width: 100%" v-model="tailLines" :min="1" :step="5000" />
          </el-tooltip>

        </el-col>

        <el-col :span="6">

          <el-button v-show="['Logs','PreviousLogs'].includes(selectedOptionValue)"  @click="updateTermLog()"  plain type="primary" >Refresh</el-button>
          <el-button @click="downloadTermLog()"  plain type="success" >Download</el-button>

        </el-col>

      </el-row>

      <el-scrollbar height="60%">
        <div v-show="selectedOptionValue==='Logs'" id="terminalLog" class="terminal"/>
        <div v-show="selectedOptionValue==='PreviousLogs'" id="terminalPreLog" class="terminal"/>
        <div v-show="selectedOptionValue==='Console'" id="terminalConsole" class="terminal"/>


      </el-scrollbar>

    </div>



</template>

<script setup>
import {Terminal} from "xterm";
import { FitAddon } from '@xterm/addon-fit';
import {Coin,Monitor, Postcard, Reading, Search, Memo} from "@element-plus/icons-vue";
import {useRoute} from "vue-router";
import {useRouter} from "vue-router";
import {apiDeploymentGet} from "@/services/deployment.js";
import {apiPodLogs} from "@/services/pod.js";
import {SearchAddon} from "@xterm/addon-search";
import {createWS} from "@/services/ws.js";
import {AttachAddon} from "@xterm/addon-attach";

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

const searchInput = ref('')
const searchIndex = ref(0)
const searchCount = ref(0)
const tailLines = ref(1000)
const route = useRoute()
const router = useRouter()

const selectState = ref({
  Logs:{
    searchAddon: null,
    fitAddon: null,
  },
  PreviousLogs:{
    searchAddon: null,
    fitAddon: null,

  },
  Console:{
    searchAddon: null,
    fitAddon: null,

  }
})
window.onresize = () => {
  allFit()
}
const allFit = () => {
  for (const key in selectState.value) {
    if (selectState.value.hasOwnProperty(key)) {
      if(selectState.value[key].fitAddon != null){
        selectState.value[key].fitAddon.fit()
      }
    }
  }
}
const addAddonToTerm = (term,stateName) => {
  const fitAddon = new FitAddon();
  const searchAddon = new SearchAddon();
  searchAddon.onDidChangeResults((item)=>{
    searchIndex.value = item.resultIndex
    searchCount.value = item.resultCount
  })
  term.loadAddon(fitAddon);
  term.loadAddon(searchAddon);
  selectState.value[stateName].searchAddon = searchAddon
  selectState.value[stateName].fitAddon = fitAddon
}

const termLog = new Terminal({
  theme: {
    background: '#000000',
    foreground: '#ffffff',
  },
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

const highlightKeyword = () => {
  const searchAddon = selectState.value[route.params.action].searchAddon

  searchAddon.findPrevious(searchInput.value,{
    matchCase: true,
    decorations:{
      matchBackground: '#1e7949'
    }
  })
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

onMounted(() => {
  selectedOptionValue.value = route.params.action

  termLog.open(document.getElementById('terminalLog'));

  terminalPreLog.open(document.getElementById('terminalPreLog'));

  terminalConsole.open(document.getElementById('terminalConsole'));

  handleSelectOption()




})
</script>

<style scoped>
.terminal {
  margin-top:10px;
  /*border-style: solid;*/
  /*border-width: 1px;*/
  border-radius: 5px;
}
</style>