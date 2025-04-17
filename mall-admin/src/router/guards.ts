import { NavigationGuardNext, RouteLocationNormalized, Router } from 'vue-router'
import { useUserStore } from '@/stores/user'

// 白名单路径，不需要登录权限可以直接访问
const whiteList = ['/login']

export function setupRouterGuards(router: Router) {
  /**
   * 全局前置守卫
   */
  router.beforeEach((to: RouteLocationNormalized, _: RouteLocationNormalized, next: NavigationGuardNext) => {
    // 设置页面标题
    const title = to.meta.title as string
    if (title) {
      document.title = `${title} - ${import.meta.env.VITE_APP_TITLE}`
    }

    // 获取用户 token
    const userStore = useUserStore()
    const token = userStore.token

    // 如果有 token，说明已登录
    if (token) {
      if (to.path === '/login') {
        // 如果已登录，跳转到首页
        next({ path: '/' })
      } else {
        // 判断用户信息是否存在
        if (userStore.userInfo) {
          next()
        } else {
          // 没有用户信息，获取用户信息
          userStore.fetchUserInfo().then(() => {
            next({ ...to, replace: true })
          }).catch(() => {
            // 获取用户信息失败，登出并重定向到登录页
            userStore.logout()
            next('/login')
          })
        }
      }
    } else {
      // 没有 token
      if (whiteList.includes(to.path)) {
        // 白名单路径，直接进入
        next()
      } else {
        // 非白名单路径，重定向到登录页
        next(`/login?redirect=${to.path}`)
      }
    }
  })

  /**
   * 全局解析守卫
   */
  router.beforeResolve(async (to: RouteLocationNormalized) => {
    // 可以在这里处理需要在导航确认之前、组件被解析之后执行的任务
    return true
  })

  /**
   * 全局后置钩子
   */
  router.afterEach(() => {
    // 导航结束后操作，比如关闭进度条
  })
} 