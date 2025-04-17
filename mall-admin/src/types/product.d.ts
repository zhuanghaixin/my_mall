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
  create_time: string
  update_time: string
  category_name?: string
}

// 商品列表查询参数
export interface ProductQueryParams {
  keyword?: string
  category_id?: number
  status?: number
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
  create_time: string
  update_time: string
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