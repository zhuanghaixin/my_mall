import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useUserStore } from '../stores/user'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

// 路由配置
const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/login/index.vue'),
    meta: {
      title: '登录',
      requiresAuth: false
    }
  },
  {
    path: '/',
    component: () => import('../layouts/BasicLayout.vue'),
    meta: {
      requiresAuth: true
    },
    children: [
      {
        path: '',
        name: 'Dashboard',
        component: () => import('../views/dashboard/index.vue'),
        meta: {
          title: '首页',
          requiresAuth: true
        }
      },
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('../views/profile/index.vue'),
        meta: {
          title: '个人资料',
          requiresAuth: true
        }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/error/404.vue'),
    meta: {
      title: '404',
      requiresAuth: false
    }
  }
]

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

// 路由守卫
router.beforeEach((to, from, next) => {
  // 开始加载进度条
  NProgress.start()
  
  // 设置页面标题
  document.title = to.meta.title ? `${to.meta.title} - 商城管理系统` : '商城管理系统'
  
  const userStore = useUserStore()
  
  // 检查路由是否需要认证
  if (to.meta.requiresAuth && !userStore.isLoggedIn()) {
    // 未登录，重定向到登录页
    next({ 
      path: '/login', 
      query: { redirect: to.fullPath } 
    })
  } else {
    next()
  }
})

router.afterEach(() => {
  // 结束加载进度条
  NProgress.done()
})

export default router 