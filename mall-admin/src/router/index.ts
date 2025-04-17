import { createRouter, createWebHistory } from 'vue-router'
import routes from './routes'
import { setupRouterGuards } from './guards'

const router = createRouter({
  history: createWebHistory(),
  routes,
  // 是否应该禁止尾部斜杠
  strict: true,
  scrollBehavior: () => ({ left: 0, top: 0 }),
})

// 设置路由守卫
setupRouterGuards(router)

export default router 