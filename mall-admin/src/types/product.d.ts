// 商品接口类型定义
export interface Product {
  id: number
  category_id: number
  name: string
  price: number
  original_price: number
  stock: number
  sales: number
  main_image: string
  images: string
  description: string
  detail: string
  status: number
  is_recommend: number
  created_at: string
  update_time: string
  category_name?: string
  category?: Category
}

// 商品列表查询参数
export interface ProductQueryParams {
  keyword?: string
  category_id?: number
  status?: number
  is_recommend?: number
  page: number
  pageSize: number
}

// 商品分类
export interface Category {
  id: number
  parent_id: number
  name: string
  icon: string
  sort: number
  status: number
  created_at: string
  update_time: string
  level?: number  // 分类层级，扁平化树形结构时使用
  fullPath?: string  // 完整分类路径，用于显示如"电子产品/手机/iPhone"的层级关系
  children?: Category[]
}

// 商品规格
export interface ProductSpec {
  name: string
  value: string
  price: number
  stock: number
}

// 分页响应数据
export interface PaginationData<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
} 