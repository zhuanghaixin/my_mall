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
      // 使用 esbuild 压缩，速度更快
      minify: 'esbuild',
      // 禁用 gzip 压缩大小报告，可略微提升构建速度
      reportCompressedSize: false,
      // 规定触发警告的 chunk 大小
      chunkSizeWarningLimit: 2000,
      // 关闭 watch 模式，减少构建时的性能开销
      watch: null,
      rollupOptions: {
        output: {
          // 优化后的分包策略，避免循环依赖问题
          manualChunks(id) {
            // node_modules 中的包按包名分割
            if (id.includes('node_modules')) {
              // Element Plus 相关（包括它的依赖和图标）
              if (id.includes('element-plus') || id.includes('@element-plus')) {
                return 'element-plus';
              }
              // 编辑器相关
              if (id.includes('@wangeditor')) {
                return 'editor';
              }
              // marked 单独分包
              if (id.includes('marked')) {
                return 'marked';
              }
              // Vue 核心库放在一起
              if (id.includes('vue/') || id.includes('vue-router') || id.includes('pinia') || id.includes('@vue/')) {
                return 'vue-vendor';
              }
              // axios 等工具库
              if (id.includes('axios')) {
                return 'utils';
              }
              // 其他第三方库
              return 'vendor';
            }
          },
          // 使用更稳定的文件名生成策略
          chunkFileNames: 'js/[name]-[hash].js',
          entryFileNames: 'js/[name]-[hash].js',
          assetFileNames: '[ext]/[name]-[hash].[ext]',
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