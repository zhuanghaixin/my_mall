import request from './request'

/**
 * 获取分类列表 (树形结构)
 */
export function getCategoryList(params?: {
  keyword?: string
  status?: number
}) {
  return request({
    url: '/admin/category/list',
    method: 'get',
    params
  })
}

/**
 * 获取分类详情
 */
export function getCategoryDetail(id: number) {
  return request({
    url: `/admin/category/${id}`,
    method: 'get'
  })
}

/**
 * 创建分类
 */
export function createCategory(data: {
  name: string
  parent_id?: number
  icon?: string
  sort?: number
  status?: number
}) {
  return request({
    url: '/admin/category',
    method: 'post',
    data
  })
}

/**
 * 更新分类
 */
export function updateCategory(id: number, data: {
  name?: string
  parent_id?: number
  icon?: string
  sort?: number
  status?: number
}) {
  return request({
    url: `/admin/category/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除分类
 */
export function deleteCategory(id: number) {
  return request({
    url: `/admin/category/${id}`,
    method: 'delete'
  })
}

/**
 * 更新分类状态
 */
export function updateCategoryStatus(id: number, status: number) {
  return request({
    url: `/admin/category/${id}/status`,
    method: 'put',
    data: { status }
  })
} 