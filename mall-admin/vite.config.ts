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
          target: env.API_URL || 'http://127.0.0.1:8080',
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
      // 关闭 watch 模式，减少构建时的性能开销
      watch: null,
      rollupOptions: {
        output: {
          // 手动分包，优化构建性能和加载速度
          manualChunks: {
            // 将 Element Plus 单独打包
            'element-plus': ['element-plus'],
            // 将 Vue 生态相关的库打包到一起
            'vue-vendor': ['vue', 'vue-router', 'pinia'],
            // 将编辑器相关库单独打包
            'editor': ['@wangeditor/editor', '@wangeditor/editor-for-vue'],
          },
        },
      },
    },
    // 依赖优化配置
    optimizeDeps: {
      include: [
        'vue',
        'vue-router',
        'pinia',
        'element-plus',
        'axios',
        '@wangeditor/editor',
        '@wangeditor/editor-for-vue',
      ],
    },
  }
}) 