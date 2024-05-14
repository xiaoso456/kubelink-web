<template>
<!--    <div   style="width: 600px;height: 600px;border-style: solid;border-width: 1px;">-->
    <div  style="margin-left: 10px;margin-right: 10px;">

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

          <el-descriptions  style="margin-top: 10px;width: 70%"  border size="default" column="4">

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
        <el-col :span="3">
          <el-tooltip effect="light" content="tail lines">
            <el-input-number style="width: 100%" v-model="tailLines" :min="1" :step="1000" />
          </el-tooltip>

        </el-col>

        <el-col :span="6">

          <el-button @click="updateTermLog()"  plain type="primary" >Refresh</el-button>
          <el-button @click="downloadTermLog()"  plain type="success" >Download</el-button>

        </el-col>

      </el-row>

      <el-scrollbar height="60%">
        <div id="terminal" class="terminal">

        </div>
      </el-scrollbar>

    </div>



</template>

<script setup>
import {Terminal} from "xterm";
import { FitAddon } from '@xterm/addon-fit';
import {Coin, Postcard, Reading, Search, Memo} from "@element-plus/icons-vue";
import {useRoute} from "vue-router";
import {useRouter} from "vue-router";
import {apiDeploymentGet} from "@/services/deployment.js";
import {apiPodLogs} from "@/services/pod.js";
import {SearchAddon} from "@xterm/addon-search";

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

const term = new Terminal({
  theme: {
    background: '#000000',
    foreground: '#ffffff',
  },
  screenReaderMode: false,
  disableStdin: true,
  convertEol: true,
  allowProposedApi: true

});
const fitAddon = new FitAddon();
const searchAddon = new SearchAddon();
const updateTermLog = ()=>{
  term.clear()
  const previous = (route.params.action === 'PreviousLogs')
  apiPodLogs(route.params.namespace,route.params.pod,route.params.container,previous,tailLines.value).then(async res => {
    const resData = await res.text()
    updateTermText(resData)

  }).catch(err => {
    ElMessage({
      message: "request error: " + err,
      type: 'error'
    })
    console.log(err)
  })
}

const downloadTermLog = () => {

  const previous = (route.params.action === 'PreviousLogs')
  apiPodLogs(route.params.namespace,route.params.pod,route.params.container,previous,tailLines.value).then(async res => {
    const resData = await res.text()
    const blob = new Blob([resData], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${route.params.namespace}-${route.params.pod}-${route.params.container}.log`; // 设置下载的文件名
    document.body.appendChild(link);
    link.click();
    URL.revokeObjectURL(url);
    document.body.removeChild(link);


  }).catch(err => {
    ElMessage({
      message: "request error: " + err,
      type: 'error'
    })
    console.log(err)
  })
}

const updateTermText = (text) => {
  fitAddon.fit();
  term.write(text)
}

const highlightKeyword = () => {

  searchAddon.findPrevious(searchInput.value,{
    matchCase: true,
    decorations:{
      matchBackground: '#1e7949'
    }
  })
}

const handleSelectOption = ()=>{
  term.clear()
  router.push(`/pod/namespace/${route.params.namespace}/pod/${route.params.pod}/container/${route.params.container}/${selectedOptionValue.value}`)
  setTimeout(()=>{
    window.location.reload()
  },50)
}

onMounted(() => {
  selectedOptionValue.value = route.params.action
  term.loadAddon(fitAddon);
  searchAddon.onDidChangeResults((item)=>{
    searchIndex.value = item.resultIndex
    searchCount.value = item.resultCount
  })
  term.loadAddon(searchAddon);
  term.open(document.getElementById('terminal'));
  updateTermLog()



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