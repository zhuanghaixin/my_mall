import { defineStore } from 'pinia'
import { ref } from 'vue'
import { adminApi } from '../api/admin'
import type { AdminInfo } from '../api/admin'

export const useUserStore = defineStore('user', () => {
  // 用户token
  const token = ref<string>(localStorage.getItem('token') || '')
  
  // 用户信息
  const userInfo = ref<AdminInfo | null>(JSON.parse(localStorage.getItem('userInfo') || 'null'))
  
  // 设置token
  function setToken(newToken: string) {
    token.value = newToken
    localStorage.setItem('token', newToken)
  }
  
  // 设置用户信息
  function setUserInfo(info: AdminInfo) {
    userInfo.value = info
    localStorage.setItem('userInfo', JSON.stringify(info))
  }
  
  // 登出
  function logout() {
    token.value = ''
    userInfo.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
  }
  
  // 判断是否已登录
  function isLoggedIn() {
    return !!token.value
  }
  
  // 获取用户信息
  async function fetchUserInfo() {
    try {
      const res = await adminApi.getProfile()
      setUserInfo(res.data.admin)
      return res.data.admin
    } catch (error) {
      console.error('获取用户信息失败', error)
      return null
    }
  }
  
  // 登录操作
  async function login(username: string, password: string) {
    try {
      const res = await adminApi.login({ username, password })
      setToken(res.data.token)
      setUserInfo(res.data.admin)
      return res.data.admin
    } catch (error) {
      console.error('登录失败', error)
      throw error
    }
  }
  
  return {
    token,
    userInfo,
    setToken,
    setUserInfo,
    logout,
    isLoggedIn,
    fetchUserInfo,
    login
  }
}, {
  persist: true
}) 