/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  readonly VITE_API_URL: string
  readonly VITE_USE_MOCK: string
  readonly VITE_USE_DEVTOOLS: string
  // 更多环境变量...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// 扩展Window接口，添加API_URL属性
interface Window {
  API_URL?: string
} 