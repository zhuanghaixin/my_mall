/**
 * 环境配置管理服务
 * 统一管理不同环境的配置访问
 */

export type Environment = 'development' | 'test' | 'staging' | 'production';

/**
 * 环境管理服务
 * 提供获取当前环境、判断环境类型和访问环境变量的方法
 */
export class EnvService {
  /**
   * 获取当前环境
   * @returns 当前环境名称
   */
  static getEnvironment(): Environment {
    return (import.meta.env.MODE || 'development') as Environment;
  }
  
  /**
   * 判断是否为开发环境
   * @returns 是否为开发环境
   */
  static isDevelopment(): boolean {
    return import.meta.env.DEV || false;
  }
  
  /**
   * 判断是否为生产环境
   * @returns 是否为生产环境
   */
  static isProduction(): boolean {
    return import.meta.env.PROD || false;
  }
  
  /**
   * 判断是否为测试环境
   * @returns 是否为测试环境
   */
  static isTest(): boolean {
    return this.getEnvironment() === 'test';
  }
  
  /**
   * 判断是否为预发布环境
   * @returns 是否为预发布环境
   */
  static isStaging(): boolean {
    return this.getEnvironment() === 'staging';
  }
  
  /**
   * 获取API基础URL
   * @returns API基础URL
   */
  static getApiUrl(): string {
    return import.meta.env.VITE_API_URL || window.API_URL || '/api';
  }
  
  /**
   * 获取应用标题
   * @returns 应用标题
   */
  static getAppTitle(): string {
    return import.meta.env.VITE_APP_TITLE || '商城管理系统';
  }
  
  /**
   * 是否启用Mock数据
   * @returns 是否启用Mock
   */
  static useMock(): boolean {
    return import.meta.env.VITE_USE_MOCK === 'true';
  }
  
  /**
   * 是否启用开发工具
   * @returns 是否启用开发工具
   */
  static useDevTools(): boolean {
    return import.meta.env.VITE_USE_DEVTOOLS === 'true';
  }
  
  /**
   * 获取所有环境变量
   * @returns 环境变量对象
   */
  static getAllEnvVars(): Record<string, string> {
    const env: Record<string, string> = {};
    
    // 获取所有以VITE_开头的环境变量
    Object.keys(import.meta.env).forEach(key => {
      if (key.startsWith('VITE_')) {
        env[key] = import.meta.env[key] as string;
      }
    });
    
    return env;
  }
}

export default EnvService; 