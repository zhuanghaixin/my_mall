import request from './request'

// 登录
export function login(data: { username: string, password: string }) {
  return request({
    url: '/api/admin/login',
    method: 'post',
    data
  })
}

// 登出
export function logout() {
  return request({
    url: '/api/admin/logout',
    method: 'post'
  })
}

// 获取用户信息
export function getUserInfo() {
  return request({
    url: '/api/admin/info',
    method: 'get'
  })
}

// 修改密码
export function updatePassword(data: { oldPassword: string, newPassword: string }) {
  return request({
    url: '/api/admin/password',
    method: 'put',
    data
  })
} 