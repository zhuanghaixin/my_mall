// 默认配置
const defaultConfig = {
  // 应用名称
  appName: import.meta.env.VITE_APP_TITLE || '商城管理系统',
  
  // API基础路径
  apiBaseUrl: import.meta.env.VITE_API_URL || '/api',
  
  // 是否使用Mock数据
  useMock: import.meta.env.VITE_USE_MOCK === 'true',
  
  // 是否开启调试工具
  useDevTools: import.meta.env.VITE_USE_DEVTOOLS === 'true',
  
  // Token在LocalStorage中的键名
  tokenKey: 'admin_token',
  
  // Token过期时间（小时）
  tokenExpire: 24,
  
  // 上传文件大小限制（MB）
  uploadLimit: 5
}

export default defaultConfig 