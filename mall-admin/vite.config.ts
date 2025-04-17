import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // 根据当前工作目录中的 `mode` 加载 .env 文件
  // 设置第三个参数为 '' 来加载所有环境变量，而不管是否有 `VITE_` 前缀。
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [vue()],
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
      },
    },
    server: {
      port: 3000,
      open: true,
      proxy: {
        '/api': {
          target: env.API_URL || 'http://localhost:8080',
          changeOrigin: true,
          // 移除rewrite以确保路径能正确传递到后端
          // rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `
            @use "@/assets/styles/variables.scss" as *;
          `,
        },
      },
    },
    build: {
      outDir: 'dist',
      sourcemap: mode === 'development',
      // minify: 'terser',
      // 禁用 gzip 压缩大小报告，可略微提升构建速度
      reportCompressedSize: false,
      // 规定触发警告的 chunk 大小
      chunkSizeWarningLimit: 2000,
    },
  }
}) 