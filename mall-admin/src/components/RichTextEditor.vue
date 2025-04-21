<template>
  <div class="rich-text-editor">
    <Toolbar
      :editor="editorRef"
      :defaultConfig="toolbarConfig"
      :mode="mode"
      style="border-bottom: 1px solid #ccc"
    />
    <Editor
      :defaultConfig="editorConfig"
      :mode="mode"
      v-model="valueHtml"
      :style="`height: ${props.height}; overflow-y: hidden;`"
      @onCreated="handleCreated"
      @onChange="handleChange"
    />
  </div>
</template>

<script setup lang="ts">
import '@wangeditor/editor/dist/css/style.css'
import { onBeforeUnmount, ref, shallowRef, watch } from 'vue'
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
import { uploadImage } from '@/api/product'

// 定义组件的props
const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  height: {
    type: String,
    default: '400px'
  },
  placeholder: {
    type: String,
    default: '请输入内容...'
  }
})

// 定义emit
const emit = defineEmits(['update:modelValue', 'change'])

// 编辑器实例，必须用 shallowRef，重要！
const editorRef = shallowRef()

// 内容 HTML
const valueHtml = ref(props.modelValue || '<p></p>')

// 监听modelValue的变化，更新编辑器内容
watch(() => props.modelValue, (newValue) => {
  if (newValue !== valueHtml.value) {
    valueHtml.value = newValue || '<p></p>'
  }
})

// 监听编辑器内容变化，更新父组件的值
watch(() => valueHtml.value, (newValue) => {
  emit('update:modelValue', newValue)
})

// 工具栏配置
const toolbarConfig = {}

// 编辑器配置
const editorConfig = { 
  placeholder: props.placeholder,
  MENU_CONF: {
    uploadImage: {
      // 上传图片的配置，与商品图片上传使用同一个API
      customUpload(file: File, insertFn: any) {
        // 使用现有的上传图片API
        uploadImage(file).then((res: any) => {
          if (res.code === 200 && res.data && res.data.url) {
            // 插入图片
            insertFn(res.data.url)
          } else {
            console.error('上传失败', res)
            alert('图片上传失败')
          }
        }).catch((error: any) => {
          console.error('上传错误', error)
          alert('图片上传失败')
        })
      }
    }
  }
}

// 编辑器模式
const mode = 'default'

// 编辑器回调函数
const handleCreated = (editor: any) => {
  editorRef.value = editor // 记录 editor 实例，重要！
}

const handleChange = (editor: any) => {
  emit('change', editor.getHtml())
}

// 组件销毁时，也及时销毁编辑器，重要！
onBeforeUnmount(() => {
  const editor = editorRef.value
  if (editor == null) return
  editor.destroy()
})
</script>

<style scoped>
.rich-text-editor {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  z-index: 100;
  margin-bottom: 10px;
}
</style> 