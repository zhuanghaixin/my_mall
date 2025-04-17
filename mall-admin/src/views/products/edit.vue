<template>
  <div class="product-edit-container">
    <el-page-header :icon="null" :title="isEdit ? '编辑商品' : '新增商品'" @back="goBack" />
    
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="120px"
      class="product-form"
    >
      <!-- 基本信息 -->
      <el-card class="form-card">
        <template #header>
          <div class="card-header">
            <h3>基本信息</h3>
          </div>
        </template>
        
        <el-form-item label="商品名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入商品名称" />
        </el-form-item>
        
        <el-form-item label="商品分类" prop="category_id">
          <el-select v-model="form.category_id" placeholder="请选择商品分类">
            <el-option
              v-for="item in categoryOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="商品价格" prop="price">
          <el-input-number
            v-model="form.price"
            :min="0"
            :precision="2"
            :step="0.1"
            controls-position="right"
          />
          <span class="form-item-unit">元</span>
        </el-form-item>
        
        <el-form-item label="原价" prop="original_price">
          <el-input-number
            v-model="form.original_price"
            :min="0"
            :precision="2"
            :step="0.1"
            controls-position="right"
          />
          <span class="form-item-unit">元</span>
        </el-form-item>
        
        <el-form-item label="商品库存" prop="stock">
          <el-input-number
            v-model="form.stock"
            :min="0"
            :precision="0"
            :step="1"
            controls-position="right"
          />
          <span class="form-item-unit">件</span>
        </el-form-item>
        
        <el-form-item label="商品状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :label="1">上架</el-radio>
            <el-radio :label="0">下架</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <el-form-item label="商品图片" prop="images">
          <el-upload
            v-model:file-list="fileList"
            action="#"
            list-type="picture-card"
            :http-request="uploadImage"
            :limit="5"
            :on-preview="handlePicturePreview"
            :on-remove="handleRemove"
            :before-upload="beforeUpload"
          >
            <el-icon><Plus /></el-icon>
          </el-upload>
          
          <el-dialog v-model="dialogVisible">
            <img w-full :src="dialogImageUrl" alt="Preview Image" />
          </el-dialog>
        </el-form-item>
      </el-card>
      
      <!-- 商品详情 -->
      <el-card class="form-card">
        <template #header>
          <div class="card-header">
            <h3>商品详情</h3>
          </div>
        </template>
        
        <el-form-item label="商品描述" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="4"
            placeholder="请输入商品简短描述"
          />
        </el-form-item>
        
        <el-form-item label="商品详情" prop="detail">
          <el-input
            v-model="form.detail"
            type="textarea"
            :rows="8"
            placeholder="请输入商品详细介绍"
          />
        </el-form-item>
        
        <!-- 商品规格 -->
        <div class="spec-section">
          <div class="spec-header">
            <h4>商品规格</h4>
            <el-button type="primary" size="small" @click="addSpec">
              <el-icon><Plus /></el-icon>添加规格
            </el-button>
          </div>
          
          <el-table :data="specs" border>
            <el-table-column label="规格名称" min-width="150">
              <template #default="{ row }">
                <el-input v-model="row.name" placeholder="如: 颜色" />
              </template>
            </el-table-column>
            
            <el-table-column label="规格值" min-width="150">
              <template #default="{ row }">
                <el-input v-model="row.value" placeholder="如: 红色" />
              </template>
            </el-table-column>
            
            <el-table-column label="价格" min-width="150">
              <template #default="{ row }">
                <el-input-number
                  v-model="row.price"
                  :min="0"
                  :precision="2"
                  :step="0.1"
                  controls-position="right"
                />
              </template>
            </el-table-column>
            
            <el-table-column label="库存" min-width="150">
              <template #default="{ row }">
                <el-input-number
                  v-model="row.stock"
                  :min="0"
                  :precision="0"
                  :step="1"
                  controls-position="right"
                />
              </template>
            </el-table-column>
            
            <el-table-column label="操作" width="120">
              <template #default="{ $index }">
                <el-button type="danger" link @click="removeSpec($index)">
                  <el-icon><Delete /></el-icon>删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-card>
      
      <!-- 表单按钮 -->
      <div class="form-actions">
        <el-button @click="goBack">取消</el-button>
        <el-button type="primary" @click="submitForm">保存</el-button>
      </div>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox, FormInstance, UploadProps, UploadUserFile } from 'element-plus'
import { Plus, Delete } from '@element-plus/icons-vue'
import {
  getProductDetail,
  addProduct,
  updateProduct,
  uploadImage as uploadImageApi,
  getCategoryList
} from '@/api/product'
import type { Product, Category, ProductSpec } from '@/types/product'

const route = useRoute()
const router = useRouter()
const formRef = ref<FormInstance>()

// 判断是编辑还是新增
const isEdit = computed(() => route.params.id !== undefined)
const productId = computed(() => Number(route.params.id))

// 表单数据
const form = reactive<Partial<Product> & { images_list?: string[] }>({
  name: '',
  category_id: undefined,
  price: 0,
  original_price: 0,
  stock: 0,
  main_image: '',
  images: '',
  images_list: [],
  description: '',
  detail: '',
  status: 1
})

// 表单验证规则
const rules = {
  name: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
  category_id: [{ required: true, message: '请选择商品分类', trigger: 'change' }],
  price: [{ required: true, message: '请输入商品价格', trigger: 'blur' }],
  stock: [{ required: true, message: '请输入商品库存', trigger: 'blur' }],
  images: [{ required: true, message: '请上传至少一张商品图片', trigger: 'change' }]
}

// 商品分类选项
const categoryOptions = ref<Category[]>([])

// 商品规格
const specs = ref<ProductSpec[]>([])

// 图片上传相关
const fileList = ref<UploadUserFile[]>([])
const dialogImageUrl = ref('')
const dialogVisible = ref(false)

// 初始化数据
onMounted(async () => {
  await fetchCategoryList()
  
  if (isEdit.value) {
    await fetchProductDetail()
  }
})

// 获取分类列表
const fetchCategoryList = async () => {
  try {
    const res = await getCategoryList() as {
      code: number
      message: string
      data: Category[]
    }
    
    if (res.code === 200) {
      categoryOptions.value = res.data
    }
  } catch (error) {
    console.error('获取分类列表失败', error)
    ElMessage.error('获取分类列表失败')
  }
}

// 获取商品详情
const fetchProductDetail = async () => {
  try {
    const res = await getProductDetail(productId.value) as {
      code: number
      message: string
      data: Product
    }
    
    if (res.code === 200) {
      const productData = res.data
      
      // 填充表单数据
      Object.keys(form).forEach(key => {
        if (key !== 'images_list' && key in productData) {
          form[key as keyof Product] = productData[key as keyof Product]
        }
      })
      
      // 处理图片列表
      if (productData.images) {
        const imagesList = productData.images.split(',')
        form.images_list = imagesList
        
        // 设置上传文件列表
        fileList.value = imagesList.map((url, index) => {
          return {
            name: `image-${index}`,
            url
          }
        })
        
        // 设置主图
        if (!form.main_image && imagesList.length > 0) {
          form.main_image = imagesList[0]
        }
      }
      
      // TODO: 获取商品规格信息（需要后端接口支持）
    } else {
      ElMessage.error(res.message || '获取商品详情失败')
    }
  } catch (error) {
    console.error('获取商品详情失败', error)
    ElMessage.error('获取商品详情失败')
  }
}

// 图片上传前检查
const beforeUpload: UploadProps['beforeUpload'] = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2
  
  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
    return false
  }
  
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB!')
    return false
  }
  
  return true
}

// 自定义上传图片
const uploadImage = async (options: any) => {
  try {
    const res = await uploadImageApi(options.file) as {
      code: number
      message: string
      data: { url: string }
    }
    
    if (res.code === 200) {
      const url = res.data.url
      
      // 如果没有主图，将第一张图设为主图
      if (!form.main_image) {
        form.main_image = url
      }
      
      // 添加到图片列表
      if (!form.images_list) {
        form.images_list = []
      }
      form.images_list.push(url)
      
      // 更新images字段（逗号分隔的字符串）
      form.images = form.images_list.join(',')
      
      // 上传成功回调
      options.onSuccess(url)
    } else {
      options.onError(new Error(res.message || '上传失败'))
      ElMessage.error(res.message || '上传失败')
    }
  } catch (error) {
    console.error('上传图片失败', error)
    options.onError(new Error('上传失败'))
    ElMessage.error('上传图片失败')
  }
}

// 图片预览
const handlePicturePreview = (file: UploadUserFile) => {
  dialogImageUrl.value = file.url || ''
  dialogVisible.value = true
}

// 移除图片
const handleRemove = (file: UploadUserFile, fileList: UploadUserFile[]) => {
  // 更新图片列表
  form.images_list = fileList.map(file => file.url || '')
  form.images = form.images_list.join(',')
  
  // 如果移除的是主图，则重新设置主图
  if (file.url === form.main_image) {
    form.main_image = form.images_list.length > 0 ? form.images_list[0] : ''
  }
}

// 添加规格
const addSpec = () => {
  specs.value.push({
    name: '',
    value: '',
    price: form.price || 0,
    stock: Math.ceil((form.stock || 0) / 10) // 默认分配一部分库存
  })
}

// 移除规格
const removeSpec = (index: number) => {
  specs.value.splice(index, 1)
}

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        // 准备提交的数据
        const submitData = { ...form }
        delete submitData.images_list // 移除辅助字段
        
        // TODO: 处理规格数据（需要后端接口支持）
        
        let res
        if (isEdit.value) {
          res = await updateProduct(productId.value, submitData) as { code: number, message: string }
        } else {
          res = await addProduct(submitData) as { code: number, message: string }
        }
        
        if (res.code === 200) {
          ElMessage.success(isEdit.value ? '商品更新成功' : '商品添加成功')
          goBack()
        } else {
          ElMessage.error(res.message || (isEdit.value ? '商品更新失败' : '商品添加失败'))
        }
      } catch (error) {
        console.error(isEdit.value ? '更新商品失败' : '添加商品失败', error)
        ElMessage.error(isEdit.value ? '商品更新失败' : '商品添加失败')
      }
    } else {
      ElMessage.error('请填写必填项')
      return false
    }
  })
}

// 返回列表页
const goBack = () => {
  router.push('/products/list')
}
</script>

<style scoped>
.product-edit-container {
  padding: 20px;
}

.product-form {
  margin-top: 20px;
}

.form-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
}

.form-item-unit {
  margin-left: 10px;
  color: #606266;
}

.spec-section {
  margin-top: 20px;
}

.spec-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.spec-header h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
}

.form-actions {
  margin-top: 30px;
  display: flex;
  justify-content: center;
  gap: 20px;
}
</style> 