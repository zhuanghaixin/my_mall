import axios from 'axios'
import { useUserStore } from '../stores/user'
import router from '../router'
import { ElMessage } from 'element-plus'

// API响应类型
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

// 创建axios实例
const request = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api', // 从环境变量获取API基础URL
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
request.interceptors.request.use(
  config => {
    const userStore = useUserStore()
    // 如果有token，添加到请求头
    if (userStore.token) {
      config.headers.Authorization = `Bearer ${userStore.token}`
    }
    
    // 添加调试日志
    console.log('API请求:', config.method?.toUpperCase(), config.url, config.params || config.data)
    
    return config
  },
  error => {
    console.error('请求拦截器错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  response => {
    // 添加调试日志
    console.log('API响应成功:', response.config.url, response.status, response.data)
    // 只返回响应的数据部分
    return response.data
  },
  error => {
    // 添加详细错误日志
    console.error('API响应错误:', 
      error.config?.url, 
      error.response?.status, 
      error.response?.data || error.message
    )
    
    const userStore = useUserStore()
    
    // 处理401错误（未授权）
    if (error.response && error.response.status === 401) {
      userStore.logout()
      router.push('/login')
      ElMessage.error('登录已过期，请重新登录')
    } else if (error.response && error.response.status === 404) {
      ElMessage.error(`接口不存在: ${error.config?.url}`)
    } else {
      // 显示错误消息
      const errorMessage = error.response?.data?.message || '请求失败'
      ElMessage.error(errorMessage)
    }
    
    return Promise.reject(error)
  }
)

export default request 