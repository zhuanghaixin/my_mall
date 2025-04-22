<template>
  <div class="product-list-container">
    <el-card class="filter-container">
      <el-form :inline="true" :model="queryParams" class="demo-form-inline">
        <el-form-item label="商品名称">
          <el-input v-model="queryParams.keyword" placeholder="请输入商品名称" clearable />
        </el-form-item>
        <el-form-item label="商品分类">
          <el-select v-model="queryParams.category_id" placeholder="请选择" clearable>
            <el-option v-for="item in categoryOptions" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="商品状态">
          <el-select v-model="queryParams.status" placeholder="请选择" clearable>
            <el-option :value="1" label="上架" />
            <el-option :value="0" label="下架" />
          </el-select>
        </el-form-item>
        <el-form-item label="推荐状态">
          <el-select v-model="queryParams.is_recommend" placeholder="请选择" clearable>
            <el-option :value="1" label="推荐" />
            <el-option :value="0" label="不推荐" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-container">
      <div class="operation-container">
        <el-button type="primary" @click="handleAdd">
          <el-icon>
            <Plus />
          </el-icon>新增商品
        </el-button>
        <el-button v-if="selectedIds.length > 0" type="success" @click="handleBatchOperation('online')">
          <el-icon>
            <TopRight />
          </el-icon>批量上架
        </el-button>
        <el-button v-if="selectedIds.length > 0" type="warning" @click="handleBatchOperation('offline')">
          <el-icon>
            <BottomRight />
          </el-icon>批量下架
        </el-button>
        <el-button v-if="selectedIds.length > 0" type="success" @click="handleBatchOperation('recommend')">
          <el-icon>
            <Star />
          </el-icon>批量推荐
        </el-button>
        <el-button v-if="selectedIds.length > 0" type="info" @click="handleBatchOperation('unrecommend')">
          <el-icon>
            <StarFilled />
          </el-icon>批量取消推荐
        </el-button>
        <el-button v-if="selectedIds.length > 0" type="danger" @click="handleBatchOperation('delete')">
          <el-icon>
            <Delete />
          </el-icon>批量删除
        </el-button>
      </div>

      <el-table v-loading="loading" :data="productList" border style="width: 100%"
        @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" />
        <el-table-column label="ID" prop="id" width="80" />
        <el-table-column label="商品图片" width="100">
          <template #default="scope">
            <el-image :src="scope.row.main_image || (scope.row.images ? scope.row.images.split(',')[0] : '')"
              :preview-src-list="scope.row.images ? scope.row.images.split(',') : [scope.row.main_image]"
              style="width: 60px; height: 60px" fit="cover" :preview-teleported="true" />
          </template>
        </el-table-column>
        <el-table-column label="商品名称" prop="name" show-overflow-tooltip />
        <el-table-column label="分类" prop="category_name" width="120">
          <template #default="scope">
            <span>{{ scope.row.category?.name || '未分类' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="价格" prop="price" width="100">
          <template #default="scope">
            <span class="price">¥{{ scope.row.price }}</span>
          </template>
        </el-table-column>
        <el-table-column label="库存" prop="stock" width="100" />
        <el-table-column label="状态" prop="status" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === 1 ? 'success' : 'info'">
              {{ scope.row.status === 1 ? '已上架' : '已下架' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="是否推荐" prop="is_recommend" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.is_recommend === 1 ? 'warning' : 'info'">
              {{ scope.row.is_recommend === 1 ? '推荐' : '普通' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" prop="created_at" width="180" />
        <el-table-column label="操作" width="240" fixed="right">
          <template #default="scope">
            <el-button type="primary" link @click="handleEdit(scope.row)">
              <el-icon>
                <Edit />
              </el-icon>编辑
            </el-button>
            <el-button type="info" link @click="showDetail(scope.row)">
              <el-icon>
                <View />
              </el-icon>详情
            </el-button>
            <el-button link :type="scope.row.status === 1 ? 'warning' : 'success'"
              @click="handleStatusChange(scope.row)">
              {{ scope.row.status === 1 ? '下架' : '上架' }}
            </el-button>
            <el-button link :type="scope.row.is_recommend === 1 ? 'info' : 'warning'"
              @click="handleRecommendChange(scope.row)">
              {{ scope.row.is_recommend === 1 ? '取消推荐' : '推荐' }}
            </el-button>
            <el-button type="danger" link @click="handleDelete(scope.row)">
              <el-icon>
                <Delete />
              </el-icon>删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination v-model:current-page="queryParams.page" v-model:page-size="queryParams.pageSize"
          :page-sizes="[10, 20, 50, 100]" :total="total" layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange" @current-change="handleCurrentChange" />
      </div>
    </el-card>

    <!-- 添加商品详情对话框 -->
    <el-dialog v-model="detailDialogVisible" title="商品详情" width="70%" destroy-on-close>
      <el-descriptions :column="1" border>
        <el-descriptions-item label="商品名称">{{ currentProduct?.name }}</el-descriptions-item>
        <el-descriptions-item label="商品分类">{{ currentProduct?.category?.name || '未分类' }}</el-descriptions-item>
        <el-descriptions-item label="价格">
          <span class="price">¥{{ currentProduct?.price }}</span>
          <span v-if="currentProduct?.original_price"
            style="text-decoration: line-through; margin-left: 10px; color: #999;">
            ¥{{ currentProduct?.original_price }}
          </span>
        </el-descriptions-item>
        <el-descriptions-item label="库存">{{ currentProduct?.stock }}</el-descriptions-item>
        <el-descriptions-item label="销量">{{ currentProduct?.sales }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="currentProduct?.status === 1 ? 'success' : 'info'">
            {{ currentProduct?.status === 1 ? '已上架' : '已下架' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="是否推荐">
          <el-tag :type="currentProduct?.is_recommend === 1 ? 'warning' : 'info'">
            {{ currentProduct?.is_recommend === 1 ? '推荐' : '普通' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ currentProduct?.created_at }}</el-descriptions-item>
        <el-descriptions-item label="商品图片">
          <div class="image-list">
            <!-- 先显示主图 -->
            <el-image v-if="currentProduct?.main_image" :src="currentProduct.main_image"
              style="width: 100px; height: 100px; margin-right: 10px" :preview-src-list="currentProduct.images ?
                [currentProduct.main_image, ...productImages] :
                [currentProduct.main_image]" :preview-teleported="true" />

            <!-- 再显示其他图片 -->
            <el-image v-for="(img, index) in productImages" :key="index" :src="img"
              style="width: 100px; height: 100px; margin-right: 10px" :preview-src-list="currentProduct?.main_image ?
                [currentProduct.main_image, ...productImages] :
                productImages" :preview-teleported="true" />
          </div>
        </el-descriptions-item>
        <el-descriptions-item label="商品描述">{{ currentProduct?.description }}</el-descriptions-item>
      </el-descriptions>

      <div class="detail-content">
        <h3>商品详情</h3>
        <div v-html="currentProduct?.detail" class="rich-text-content"></div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Edit, Delete, TopRight, BottomRight, View, Star, StarFilled } from '@element-plus/icons-vue'
import {
  getProductList,
  updateProductStatus,
  updateProductRecommend,
  deleteProduct,
  batchOperateProducts,
  getProductDetail
} from '@/api/product'
import { getCategoryList } from '@/api/category'
import type { Product, Category, PaginationData, ProductQueryParams } from '@/types/product'
import type { ApiResponse } from '@/api/request'

const router = useRouter()
const loading = ref(false)
const productList = ref<Product[]>([])
const total = ref(0)
const selectedIds = ref<number[]>([])
const categoryOptions = ref<Category[]>([])

// 查询参数
const queryParams = reactive<ProductQueryParams & { is_recommend?: number }>({
  keyword: '',
  category_id: undefined,
  status: undefined,
  is_recommend: undefined,
  page: 1,
  pageSize: 10
})

// 商品详情相关
const detailDialogVisible = ref(false)
const currentProduct = ref<Product | null>(null)
const productImages = computed(() => {
  if (!currentProduct.value?.images) return []
  const imageList = currentProduct.value.images.split(',')

  // 如果main_image存在且在images列表中，过滤掉重复的main_image
  if (currentProduct.value.main_image) {
    return imageList.filter(img => img !== currentProduct.value?.main_image)
  }

  return imageList
})

// 初始化
onMounted(() => {
  console.log('商品列表组件已加载')
  fetchProductList()
  fetchCategoryList()
})

// 获取商品列表
const fetchProductList = async () => {
  loading.value = true
  try {
    console.log('获取商品列表...')
    const res = await getProductList(queryParams) as unknown as ApiResponse<PaginationData<Product>>

    if (res.code === 200) {
      productList.value = res.data.list
      total.value = res.data.total
      console.log('获取商品列表成功', res.data)
    } else {
      ElMessage.error(res.message || '获取商品列表失败')
    }
  } catch (error) {
    console.error('获取商品列表失败', error)
    ElMessage.error('获取商品列表失败')
  } finally {
    loading.value = false
  }
}

// 获取分类列表
const fetchCategoryList = async () => {
  try {
    const res = await getCategoryList() as unknown as ApiResponse<Category[]>

    if (res.code === 200) {
      categoryOptions.value = res.data
    }
  } catch (error) {
    console.error('获取分类列表失败', error)
  }
}

// 搜索
const handleSearch = () => {
  queryParams.page = 1
  fetchProductList()
}

// 重置搜索条件
const resetQuery = () => {
  queryParams.keyword = ''
  queryParams.category_id = undefined
  queryParams.status = undefined
  queryParams.is_recommend = undefined
  queryParams.page = 1
  fetchProductList()
}

// 处理多选变化
const handleSelectionChange = (selection: Product[]) => {
  selectedIds.value = selection.map(item => item.id)
}

// 处理批量操作
const handleBatchOperation = async (operation: string) => {
  if (selectedIds.value.length === 0) {
    ElMessage.warning('请至少选择一项')
    return
  }

  let confirmMessage = '确定要批量操作所选商品吗？'
  if (operation === 'delete') {
    confirmMessage = '确定要删除所选商品吗？此操作不可逆！'
  } else if (operation === 'online') {
    confirmMessage = '确定要上架所选商品吗？'
  } else if (operation === 'offline') {
    confirmMessage = '确定要下架所选商品吗？'
  } else if (operation === 'recommend') {
    confirmMessage = '确定要将所选商品设为推荐吗？'
  } else if (operation === 'unrecommend') {
    confirmMessage = '确定要取消所选商品的推荐状态吗？'
  }

  try {
    await ElMessageBox.confirm(confirmMessage, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    loading.value = true
    const res = await batchOperateProducts({
      ids: selectedIds.value,
      operation: operation
    }) as unknown as ApiResponse

    if (res.code === 200) {
      ElMessage.success(res.message || '批量操作成功')
      fetchProductList()
    } else {
      ElMessage.error(res.message || '批量操作失败')
    }
  } catch (error) {
    console.error('批量操作失败', error)
  } finally {
    loading.value = false
  }
}

// 更改商品状态
const handleStatusChange = (row: Product) => {
  const status = row.status === 1 ? 0 : 1
  const statusText = status === 1 ? '上架' : '下架'

  ElMessageBox.confirm(`确认要${statusText}该商品吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const res = await updateProductStatus(row.id, status) as unknown as ApiResponse

      if (res.code === 200) {
        ElMessage.success(`${statusText}成功`)
        fetchProductList()
      } else {
        ElMessage.error(res.message || `${statusText}失败`)
      }
    } catch (error) {
      console.error(`${statusText}失败`, error)
      ElMessage.error(`${statusText}失败`)
    }
  }).catch(() => {
    // 用户取消操作
  })
}

// 更改商品推荐状态
const handleRecommendChange = (row: Product) => {
  const isRecommend = row.is_recommend === 1 ? 0 : 1
  const actionText = isRecommend === 1 ? '推荐' : '取消推荐'

  ElMessageBox.confirm(`确认要${actionText}该商品吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const res = await updateProductRecommend(row.id, isRecommend) as unknown as ApiResponse

      if (res.code === 200) {
        ElMessage.success(`${actionText}成功`)
        fetchProductList()
      } else {
        ElMessage.error(res.message || `${actionText}失败`)
      }
    } catch (error) {
      console.error(`${actionText}失败`, error)
      ElMessage.error(`${actionText}失败`)
    }
  }).catch(() => {
    // 用户取消操作
  })
}

// 删除商品
const handleDelete = (row: Product) => {
  ElMessageBox.confirm('确认删除该商品吗？此操作不可恢复！', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const res = await deleteProduct(row.id) as unknown as ApiResponse

      if (res.code === 200) {
        ElMessage.success('删除成功')
        fetchProductList()
      } else {
        ElMessage.error(res.message || '删除失败')
      }
    } catch (error) {
      console.error('删除失败', error)
      ElMessage.error('删除失败')
    }
  }).catch(() => {
    // 用户取消操作
  })
}

// 新增商品
const handleAdd = () => {
  router.push('/products/add')
}

// 编辑商品
const handleEdit = (row: Product) => {
  router.push(`/products/edit/${row.id}`)
}

// 查看商品详情
const showDetail = async (row: Product) => {
  try {
    const res = await getProductDetail(row.id) as unknown as ApiResponse<Product>
    if (res.code === 200) {
      currentProduct.value = res.data
      detailDialogVisible.value = true
    } else {
      ElMessage.error(res.message || '获取商品详情失败')
    }
  } catch (error) {
    console.error('获取商品详情失败', error)
    ElMessage.error('获取商品详情失败')
  }
}

// 处理分页大小变化
const handleSizeChange = (size: number) => {
  queryParams.pageSize = size
  fetchProductList()
}

// 处理页码变化
const handleCurrentChange = (page: number) => {
  queryParams.page = page
  fetchProductList()
}
</script>

<style scoped>
.product-list-container {
  padding: 20px;
}

.filter-container,
.table-container {
  margin-bottom: 20px;
}

.operation-container {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.price {
  color: #f56c6c;
  font-weight: bold;
}

.image-list {
  display: flex;
  flex-wrap: wrap;
  margin-top: 10px;
}

.detail-content {
  margin-top: 20px;
  border-top: 1px solid #ebeef5;
  padding-top: 20px;
}

.rich-text-content {
  padding: 15px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  background-color: #f9f9f9;
  min-height: 150px;
}

/* 解除scoped限制，确保富文本内容样式生效 */
:deep(.rich-text-content img) {
  max-width: 100%;
}

:deep(.rich-text-content p) {
  margin: 0.5em 0;
}

/* 确保图片预览弹窗在最高层级 */
:deep(.el-image-viewer__wrapper) {
  z-index: 2100 !important;
}
</style>