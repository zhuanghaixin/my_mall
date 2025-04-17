import request from './request'

/**
 * 获取商品列表
 */
export function getProductList(params: {
  keyword?: string
  category_id?: number
  status?: number
  page?: number
  pageSize?: number
}) {
  return request({
    url: '/admin/goods/list',
    method: 'get',
    params
  })
}

/**
 * 获取商品详情
 */
export function getProductDetail(id: number) {
  return request({
    url: `/admin/goods/${id}`,
    method: 'get'
  })
}

/**
 * 添加商品
 */
export function addProduct(data: any) {
  return request({
    url: '/admin/goods',
    method: 'post',
    data
  })
}

/**
 * 更新商品
 */
export function updateProduct(id: number, data: any) {
  return request({
    url: `/admin/goods/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除商品
 */
export function deleteProduct(id: number) {
  return request({
    url: `/admin/goods/${id}`,
    method: 'delete'
  })
}

/**
 * 更新商品状态（上架/下架）
 */
export function updateProductStatus(id: number, status: number) {
  return request({
    url: `/admin/goods/${id}/status`,
    method: 'put',
    data: { status }
  })
}

/**
 * 批量操作商品
 */
export function batchOperateProducts(data: {
  ids: number[]
  action: string // 'status' 或 'delete'
  value?: number // 当action为'status'时传入状态值
}) {
  return request({
    url: '/admin/goods/batch',
    method: 'post',
    data
  })
}

/**
 * 上传图片
 */
export function uploadImage(file: File) {
  const formData = new FormData()
  formData.append('file', file)
  
  return request({
    url: '/upload/image',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

/**
 * 获取商品分类
 */
export function getCategoryList() {
  return request({
    url: '/admin/categories',
    method: 'get'
  })
} 