<template>
  <el-dialog
      class="none-box"
      v-model="dialogVisible"
      title="Import"
      width="80vw"
  >

    <el-segmented v-model="selectedImportOption" :options="exportOptions"  >
      <template #default="{ item }">
        <div  style="min-width: 100px;margin: 5px 0 5px 0" class="flex flex-col items-center gap-2 p-2">
          <div>{{ item.label }}</div>
        </div>
      </template>
    </el-segmented>
    <el-input class="mt-10" type="textarea" :autosize="{maxRows: 24,minRows: 6}" style="width: 100%"  v-model="shareText" />
    <el-row justify="end">
      <el-button class="mt-10" @click="emit('update:modelValue', false);">cancel</el-button>
      <el-button type="primary" @click="handleImport(shareText)" plain class="mt-10" >import</el-button>
    </el-row>
  </el-dialog>
</template>

<script setup>
import {apiImport} from "@/services/share.js";
import { Base64 } from 'js-base64';

const dialogVisible = ref(false)

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
const selectedImportOption = ref('Json')
const props = defineProps({
  modelValue: {
    type: Boolean,
    required: false,
  }
});
const emit = defineEmits(['update:modelValue', 'import-success']);
watch(() => props.modelValue, (newVal) => {

  dialogVisible.value = newVal

})


watch(dialogVisible, (newVal) => {
  shareText.value = ''
  emit('update:modelValue', newVal)
})


const shareText = ref('')


onMounted(() => {
  selectedImportOption.value = 'Json'

})




const handleImport = (text) => {
  let importText = ''
  if(selectedImportOption.value === 'Base64'){
    importText = Base64.decode(text)
  }else{
    importText = text
  }
  apiImport(importText).then(async res => {
    const status = res.status
    if(status === 200 || status === 201){
      ElMessage({
        message: "import success",
        type: 'success'
      })
      emit('update:modelValue', false)
      emit('import-success')
    }else{
      ElMessage({
        message: "import fail",
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



</script>

<style scoped>

</style>