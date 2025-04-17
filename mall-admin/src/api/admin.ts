import request from './request';
import type { AxiosRequestConfig } from 'axios';

// 定义接口返回类型
interface AdminLoginResponse {
  status: string;
  message: string;
  data: {
    admin: AdminInfo;
    token: string;
  };
}

interface AdminProfileResponse {
  status: string;
  data: {
    admin: AdminInfo;
  };
}

interface HealthCheckResponse {
  status: string;
  message: string;
  time: string;
}

// 管理员信息类型
interface AdminInfo {
  id: number;
  username: string;
  realName: string | null;
  email: string | null;
  phone: string | null;
  avatar: string | null;
  role: string;
  status: string;
  lastLoginTime: string | null;
}

// 登录参数类型
interface LoginParams {
  username: string;
  password: string;
}

export const adminApi = {
  /**
   * 管理员登录
   * @param params 登录参数
   */
  login(params: LoginParams) {
    return request<any, AdminLoginResponse>({
      url: '/admin/login',
      method: 'post',
      data: params
    });
  },

  /**
   * 获取当前管理员信息
   */
  getProfile(config?: AxiosRequestConfig) {
    return request<any, AdminProfileResponse>({
      url: '/admin/profile',
      method: 'get',
      ...config
    });
  },

  /**
   * 检查服务器健康状态
   */
  checkHealth() {
    return request<any, HealthCheckResponse>({
      url: '/health',
      method: 'get'
    });
  }
};

export type { AdminInfo }; 