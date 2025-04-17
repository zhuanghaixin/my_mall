import axios, { AxiosInstance } from 'axios'
import { ElMessage } from 'element-plus'
import { getToken } from '@/utils/auth'

// 创建 axios 实例
const request: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json;charset=utf-8',
  },
})

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    // 添加token
    const token = getToken()
    if (token && config.headers) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    console.log(error)
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    // 开发阶段，直接返回响应数据，不做校验
    // 模拟API返回数据格式
    return {
      code: 200,
      data: response.data || {
        token: 'dev-token-123456',
        user: {
          id: 1,
          username: 'admin',
          avatar: '',
          roles: ['admin']
        }
      },
      message: 'success'
    }
  },
  (error) => {
    console.log('请求错误', error)
    
    ElMessage({
      message: '网络请求失败，请稍后重试',
      type: 'error',
      duration: 5 * 1000,
    })
    return Promise.reject(error)
  }
)

export default request 