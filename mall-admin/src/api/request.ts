import axios from 'axios'
import { useUserStore } from '../stores/user'
import router from '../router'
import { ElMessage } from 'element-plus'

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
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  response => {
    // 只返回响应的数据部分
    return response.data
  },
  error => {
    const userStore = useUserStore()
    
    // 处理401错误（未授权）
    if (error.response && error.response.status === 401) {
      userStore.logout()
      router.push('/login')
      ElMessage.error('登录已过期，请重新登录')
    } else {
      // 显示错误消息
      const errorMessage = error.response?.data?.message || '请求失败'
      ElMessage.error(errorMessage)
    }
    
    return Promise.reject(error)
  }
)

export default request 