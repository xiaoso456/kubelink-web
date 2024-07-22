<template>
  <el-dialog
      class="none-box"
      v-model="dialogVisible"
      :title="title"
      width="80vw"
  >

    <el-segmented   v-model="selectedExportOption" :options="exportOptions"  >
      <template #default="{ item }">
        <div  style="min-width: 100px;margin: 5px 0 5px 0" class="flex flex-col items-center gap-2 p-2">
          <div>{{ item.label }}</div>
        </div>
      </template>
    </el-segmented>
    <el-input class="mt-10" type="textarea" :autosize="{maxRows: 24,minRows: 6}" style="width: 100%"  v-model="shareText" />
    <el-row justify="end">
      <el-button class="mt-10" @click="emit('update:modelValue', false);">{{ t('common.cancel') }}</el-button>
      <el-button type="primary" @click="handleCopy(shareText)" plain class="mt-10" >{{ t('common.copy') }}</el-button>
      <el-button type="success" @click="handleDownload(shareText)" plain class="mt-10" >{{ t('common.download') }}</el-button>
    </el-row>
  </el-dialog>
</template>

<script setup>
import { Base64 } from 'js-base64';
import useClipboard from 'vue-clipboard3';
const { toClipboard } = useClipboard();
const dialogVisible = ref(false)
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
const exportOptions = [
  {
    label: 'Json',
    value: 'Json'
  },
  {
    label: 'Base64',
    value: 'Base64'
  },

]
const selectedExportOption = ref('Json')
const props = defineProps({
  modelValue: {
    type: Boolean,
    required: false,
  },
  exportData:{
    type: String,
    required: false,
    default: () => {
      return ''
    }
  },
  title:{
    type: String,
    required: false,
    default: () => {
      return 'share'
    }
  }
});

watch(() => props.modelValue, (newVal) => {
  selectedExportOption.value = 'Json'
  sharedJson.value = props.exportData
  shareText.value = props.exportData
  dialogVisible.value = newVal

})

watch(dialogVisible, (newVal) => {
  emit('update:modelValue', newVal)
})

const sharedJson = ref('')
watch(() => props.exportData, (newVal) => {
  sharedJson.value = newVal
})

const shareText = ref('')
watch(()=>[selectedExportOption.value], (newVal,oldVal) => {
  if (newVal[0] === 'Json') {
    shareText.value = Base64.decode(shareText.value)
    // shareText.value = atob(shareText.value)
  } else if(newVal[0] === 'Base64'){
    shareText.value = Base64.encode(shareText.value)
    // shareText.value = btoa(shareText.value)
  }
})


onMounted(() => {
  selectedExportOption.value = 'Json'

})



const emit = defineEmits(['update:modelValue']);

const handleCopy = (text) => {
  toClipboard(text).then(() => {
    ElMessage({
      message: 'copy success',
      type: 'success'
    })
  }).catch(err => {
    ElMessage({
      message: 'copy error: ' + err,
      type: 'error'
    })
  })
}

const handleDownload = (text) => {
  const blob = new Blob([text], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'share.json'
  link.click()
  URL.revokeObjectURL(url)
  link.remove()

}


</script>

<style scoped>

</style>