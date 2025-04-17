import { createRouter, createWebHistory } from 'vue-router'
import routes from './routes'
import { setupRouterGuards } from './guards'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 配置NProgress
NProgress.configure({ 
  easing: 'ease',
  speed: 500,
  showSpinner: false
})

// 设置路由守卫
setupRouterGuards(router)

export default router 