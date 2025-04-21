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

// 获取小程序用户列表
export function getUserList(params: {
  keyword?: string;
  status?: string | number;
  pageNum?: number;
  pageSize?: number;
}) {
  return request({
    url: '/api/admin/user/list',
    method: 'get',
    params
  })
}

// 获取小程序用户详情
export function getUserDetail(id: number) {
  return request({
    url: `/api/admin/user/${id}`,
    method: 'get'
  })
}

// 更新用户状态
export function updateUserStatus(id: number, status: number) {
  return request({
    url: `/api/admin/user/${id}/status`,
    method: 'put',
    data: { status }
  })
}

// 重置用户密码
export function resetUserPassword(id: number) {
  return request({
    url: `/api/admin/user/${id}/reset-password`,
    method: 'post'
  })
} 