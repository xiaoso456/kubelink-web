<template>
  <div class="ml-10 mr-10">
    <el-row align="top">
      <el-segmented  v-model="selectedOptionValue" :options="typeOptions"  >
        <template #default="{ item }">
          <div  style="min-width: 100px;margin: 5px 0 5px 0" class="flex flex-col items-center gap-2 p-2">
            <el-icon size="20">
              <component :is="{...item.icon}" />
            </el-icon>
            <div>{{ item.label }}</div>
          </div>
        </template>
      </el-segmented>

    </el-row>

    <el-row class="mt-10">

      <!--    <div class="mt-4 common-margin"  style="width: 80%;">-->
      <el-col :span="18">
        <el-input
            v-model="searchInput"
            style="max-width: 100%"
            @change="refreshTextTemplateList"
            :placeholder="t('common.search-tip')"
            clearable
        >
          <template #prepend>
            <el-select
                @click="refreshTextTemplateTypeList"
                @change="refreshTextTemplateList"
                v-model="selectedTemplateTypeOptionValue"
                :placeholder="t('common.all')"
                style="width: 200px"
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
          </template>
          <template #append>
            <el-button @click="refreshTextTemplateList" :icon="Search" />
          </template>
        </el-input>
      </el-col>
      <el-col :span="6" class="ml-10">
        <el-button type="success" plain @click="importDialogShow=true" >{{ t('common.import') }}</el-button>
      </el-col>
      <!--    </div>-->

    </el-row>

    <el-row >
      <el-col v-for="item in templateListRaw" :xs="24" :sm="12" :md="6" :xl="4" >
        <el-card  class="none-box"  style="max-width: 300px;margin-top: 20px" shadow="never">
          <template #header >
            <div >
              <el-text type="primary"  line-clamp="1" size="large" >
                {{ item.name }}
              </el-text>
            </div>
          </template>
          <template #footer>
            <el-row justify="end">
              <el-button size="small" plain type="success" @click="handleClickCopy(item)">{{ t('common.copy') }}</el-button>
              <el-button size="small" plain type="warning" @click="handleClickShare(item)">{{ t('common.share') }}</el-button>
              <el-button size="small" plain type="primary" @click="handleClickDetail(item)">{{ t('common.detail') }}</el-button>
              <el-button size="small" plain type="danger" @click="handleClickDelete(item)">{{ t('common.delete') }}</el-button>
            </el-row>

          </template>
          <el-text line-clamp="2">
            {{ item.content }}
          </el-text>
        </el-card>
      </el-col>
    </el-row>
  </div>


<!--  <el-card style="max-width: 360px">-->
<!--    <template #header>-->
<!--      <div class="card-header">-->
<!--        <span>Card name</span>-->
<!--      </div>-->
<!--    </template>-->
<!--    <p v-for="o in 4" :key="o" class="text item">{{ 'List item ' + o }}</p>-->
<!--    <template #footer>Footer content</template>-->
<!--  </el-card>-->

  <el-dialog
      v-model="templateDialogVisible"
      width="80%"
      :before-close="handleClose"
      class="none-box"
  >
    <template #header="{ close, titleId, titleClass }">
      <div>
        <span>{{ t('common.template') }}</span>
        <el-tooltip
            class="box-item"
            effect="light"
            :content="t('text-template-page.add-or-edit-template-tooltip')"
            placement="top-start"
        >
          <el-icon style="margin-left: 4px" size="14"><QuestionFilled /></el-icon>

        </el-tooltip>
      </div>
    </template>

    <el-form :model="templateForm" label-width="auto" style="max-width: 1000px">
      <el-form-item :label="t('common.name')">
        <el-input v-model="templateForm.name" />
      </el-form-item>
      <el-form-item :label="t('common.type')">
        <el-input v-model="templateForm.type" />
      </el-form-item>
      <el-form-item :label="t('common.content')"  >
        <el-input v-model="templateForm.content" :autosize="{ minRows: 2, maxRows: 26 }" type="textarea" />
      </el-form-item>
      <el-form-item :label="t('common.description')"  >
        <el-input v-model="templateForm.description" :autosize="{ minRows: 2, maxRows: 26 }" type="textarea" />
      </el-form-item>


      <el-divider  content-position="left" >{{ t('common.vars') }}</el-divider>
<!--      <el-form-item v-for="(value,key) in templateForm.templateVariables" :label="key">-->
<!--        <el-input v-model="templateForm.templateVariables[key]" autosize  />-->
<!--      </el-form-item>-->
      <el-table :data="templateVarsTableData" >
        <el-table-column prop="key" label="Key" width="160" >
          <template #default="scope" >
            <el-input ref="focusRef"  v-if="scope.$index === tableEditIndex && 'key'===tableEditFieldName" v-model="scope.row.key" @keyup.enter.native="$event.target.blur()" @blur="handleExitEditMode(scope.$index,'key')"></el-input>
            <p v-else  @click="handleIntoEditMode(scope.$index,'key')"  >{{ scope.row.key?scope.row.key:'-' }}</p>
          </template>

        </el-table-column>


        <el-table-column prop="value" label="Value">
          <template #default="scope" >
            <el-input ref="focusRef"  v-if="scope.$index === tableEditIndex && 'value'===tableEditFieldName" v-model="scope.row.value" @keyup.enter.native="$event.target.blur()" @blur="handleExitEditMode(scope.$index,'value')"></el-input>
            <p v-else  @click="handleIntoEditMode(scope.$index,'value')"  >{{ scope.row.value?scope.row.value:'-' }}</p>
          </template>
        </el-table-column>


        <el-table-column :label="t('common.operation')">
          <template #default="scope">
            <el-button size="small" type="danger"  plain @click="delete(templateForm.templateVariables[scope.row.key])">{{ t('common.delete') }}</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-button style="width: 100%;margin-top: 10px"  @click="handleAddTemplateVariablesItem">{{ t('common.add-item') }}</el-button>


      <el-divider  content-position="left" >{{ t('common.preview') }}</el-divider>
      <el-input readonly v-model="templateContentPreview" :autosize="{ minRows: 2, maxRows: 26 }" type="textarea" />
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button plain @click="templateDialogVisible = false">{{ t('common.cancel') }}</el-button>
<!--        <el-button plain type="primary">Create Instance</el-button>-->
        <el-button plain type="success" @click="handleCreateOrUpdateTemplate">
          {{ t('common.'+templateAction) }}
        </el-button>
      </div>
    </template>
  </el-dialog>


  <el-button round plain link type="success" @click="handleClickCreate" class="fixed-button">
    <el-icon size="30px"  >
      <CirclePlusFilled />
    </el-icon>
  </el-button>

  <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="500"
  >
    <span>{{ dialogMessage }}</span>
    <template #footer>
      <div class="dialog-footer">
        <el-button plain @click="dialogVisible = false">{{ t('common.cancel') }}</el-button>
        <el-button plain type="success" @click="dialogConfirmFuctionLast">
          {{ t('common.confirm') }}
        </el-button>
      </div>
    </template>
  </el-dialog>

  <import-dialog v-model="importDialogShow"  @import-success="refreshTextTemplateList"></import-dialog>
  <share-dialog v-model="exportDialogShow" :exportData="exportData" title="Template"></share-dialog>

</template>

<script setup>
import {onMounted, ref} from "vue";
import {CirclePlusFilled, Postcard, Search} from "@element-plus/icons-vue";
import {
  apiTextTemplateCreate,
  apiTextTemplateDelete,
  apiTextTemplateList,
  apiTextTemplateTypeList,
  apiTextTemplateUpdate
} from "@/services/textTemplate.js";
import Handlebars from "handlebars";
import {apiClusterConfigExport, apiTextTemplateExport} from "@/services/share.js";
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
const searchInput = ref('')

const templateDialogVisible = ref(false)
const templateAction = ref('Create')
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
const tableEditIndex = ref(-1)
const tableEditFieldName = ref('')
const focusRef = ref(null);

const dialogVisible = ref(false)
const dialogTitle = ref('')
const dialogMessage = ref('')
const dialogConfirmFuction = ref(() => {dialogVisible.value = false})
const dialogConfirmFuctionLast = ref(() => {dialogVisible.value = false;dialogConfirmFuction.value()})

const templateTypeOptions = ref([])
const selectedTemplateTypeOptionValue = ref('')

const exportDialogShow = ref(false)
const exportData = ref('')

const importDialogShow = ref(false)

const handleIntoEditMode = (index, propName) => {
  tableEditIndex.value = index
  tableEditFieldName.value=propName
  setTimeout(() => {
    focusRef.value.focus()
  }, 10)
}

const handleExitEditMode = async (index,row) => {
  let varMap = {}
  for (let i = 0; i < templateVarsTableData.value.length; i++) {
    varMap[templateVarsTableData.value[i].key] = templateVarsTableData.value[i].value
  }
  templateForm.value.templateVariables = varMap
  tableEditIndex.value = -1
  tableEditFieldName.value = ''

}

const templateVarsTableData = computed(() => {
  if(!templateForm.value.templateVariables){
    return {}
  }

  return Object.keys(templateForm.value.templateVariables).map(key => {
    return {
      key: key,
      value: templateForm.value.templateVariables[key]
    }
  })
})


const handleAddTemplateVariablesItem = () => {
  let addOk = false
  let randomNumber = 0;
  while(!addOk){
    randomNumber++;
    // 将随机数转换为字符串，并在前面补零，确保生成的数字始终为 6 位数
    let randomNumberString = 'key-' + randomNumber.toString().padStart(3, '0');
    if(templateForm.value.templateVariables.hasOwnProperty(randomNumberString)){
      continue
    }
    templateForm.value.templateVariables[randomNumberString] = 'value'
    addOk = true
  }


}

const selectedOptionValue = ref('Template')
const typeOptions = ref([
  {
    label: 'Template',
    value: 'Template',
    icon: Postcard,
    disabled: false
  },
  // {
  //   label: 'Instance',
  //   value: 'Instance',
  //   icon: Coin,
  //   disabled: false
  // }
])

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
const templateContentPreview = computed(() => {
  const template = Handlebars.compile(templateForm.value.content)
  try {
    return template(templateForm.value.templateVariables)

  }catch (error){
    return error
  }

})
const handleClose = () => {
  templateDialogVisible.value = false
}

const handleClickCopy = async (item) => {
  await apiTextTemplateCreate(item).then(async res => {
    const status = res.status
    if (status === 200 || status === 201) {
      ElMessage({
        message: `create template ${templateForm.value.name} success`,
        type: 'success'
      })
    }else{
      ElMessage({
        message: `create template ${templateForm.value.name} failed`,
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
  refreshTextTemplateList()
}

const handleClickShare = (item) => {
  apiTextTemplateExport([item.id]).then(async res => {
    const resData = await res.json()
    exportData.value = JSON.stringify(resData,null,2)
    exportDialogShow.value = true

  }).catch(err => {
    ElMessage({
      message: "request error: " + err,
      type: 'error'
    })
    console.log(err)
  })
}

const handleClickDetail = (item) => {
  templateForm.value = item
  templateAction.value = 'Update'
  templateDialogVisible.value = true
}

const handleClickDelete = (row) => {

  dialogVisible.value = true
  dialogTitle.value = t("common.tips")
  dialogMessage.value = `delete template '${row.name}'`
  dialogConfirmFuction.value = async () => {
    await apiTextTemplateDelete(row.id).then(async res => {
      if (res.status === 200) {
        ElMessage({
          message: `delete template ${row.name} success`,
          type: 'success'
        })
      }
    }).catch(err => {
      ElMessage({
        message: "request error: " + err,
        type: 'error'
      })
      console.log(err)
    })

    refreshTextTemplateList()
  }

}

const handleClickCreate = () => {
  templateForm.value = {
    id: '1',
    name: 'name',
    content: 'content',
    type: 'command',
    description: 'description',
    version: 1,
    templateVariables: {
      key1: 'value1'
    }
  }
  templateAction.value = 'Create'
  templateDialogVisible.value = true
}

const handleCreateOrUpdateTemplate = () => {
  if(templateAction.value === 'Create'){
    createCurrentTemplate()
  }else{
    saveCurrentTemplate()
  }
  templateDialogVisible.value = false
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

const saveCurrentTemplate = async () => {
  await apiTextTemplateUpdate(templateForm.value.id, templateForm.value).then(async res => {
    const status = res.status
    if (status === 200) {
      ElMessage({
        message: `update template ${templateForm.value.name} success`,
        type: 'success'
      })
    }

  }).catch(err => {
    ElMessage({
      message: "request error: " + err,
      type: 'error'
    })
    console.log(err)
  })
  refreshTextTemplateList()
}

const createCurrentTemplate = async () => {

  await apiTextTemplateCreate(templateForm.value).then(async res => {
    const status = res.status
    if (status === 200 || status === 201) {
      ElMessage({
        message: `create template ${templateForm.value.name} success`,
        type: 'success'
      })
    }

  }).catch(err => {
    ElMessage({
      message: "request error: " + err,
      type: 'error'
    })
    console.log(err)
  })
  refreshTextTemplateList()
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

onMounted(() => {
  refreshTextTemplateTypeList()
  refreshTextTemplateList()
})
</script>

<style scoped>


>>>.el-card__header {

  padding: 5px 10px 5px 10px;
}
>>>.el-card__body{
  padding: 10px 10px 5px 10px;
}
>>>.el-card__footer{
  padding: 5px 10px 5px 10px;
}


.fixed-button{
  position: fixed;
  bottom: 60px;
  right: 60px;
}

.fixed-button-import{
  position: fixed;
  bottom: 60px;
  right: 20px;
}
.my-header {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  gap: 16px;
}
</style>