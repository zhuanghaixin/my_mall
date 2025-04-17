import { defineStore } from 'pinia'
import { ref } from 'vue'
import { login, logout, getUserInfo } from '@/api/user'
import { getToken, setToken, removeToken } from '@/utils/auth'

export const useUserStore = defineStore('user', () => {
  // 用户token
  const token = ref<string>(getToken() || '')
  // 用户信息
  const userInfo = ref<Record<string, any>>({})
  // 是否拥有用户信息
  const hasUserInfo = ref<boolean>(false)

  // 登录
  async function loginAction(username: string, password: string) {
    try {
      const { data } = await login({ username, password })
      setToken(data.token)
      token.value = data.token
      
      // 登录成功后立即获取用户信息
      await getUserInfoAction()
      
      return Promise.resolve()
    } catch (error) {
      return Promise.reject(error)
    }
  }

  // 获取用户信息
  async function getUserInfoAction() {
    try {
      // 开发环境模拟用户数据
      userInfo.value = {
        id: 1,
        username: 'admin',
        nickname: '管理员',
        avatar: '',
        role: 'admin',
        permissions: ['dashboard', 'users', 'products', 'orders']
      }
      hasUserInfo.value = true
      return Promise.resolve(userInfo.value)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  // 登出
  async function logoutAction() {
    try {
      await logout()
      resetState()
      return Promise.resolve()
    } catch (error) {
      return Promise.reject(error)
    }
  }

  // 重置状态
  function resetState() {
    token.value = ''
    userInfo.value = {}
    hasUserInfo.value = false
    removeToken()
  }

  return {
    token,
    userInfo,
    hasUserInfo,
    login: loginAction,
    getUserInfo: getUserInfoAction,
    logout: logoutAction,
    resetState
  }
}) 