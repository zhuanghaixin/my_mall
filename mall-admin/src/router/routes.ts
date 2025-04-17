import { RouteRecordRaw } from 'vue-router'

// 布局组件
const BasicLayout = () => import('@/layouts/BasicLayout.vue')
const LoginLayout = () => import('@/layouts/LoginLayout.vue')

// 基础页面
const Dashboard = () => import('@/views/dashboard/index.vue')
const NotFound = () => import('@/views/error/404.vue')
const Login = () => import('@/views/login/index.vue')

// 基本路由，不需要权限的路由
export const constantRoutes: RouteRecordRaw[] = [
  {
    path: '/login',
    component: LoginLayout,
    children: [
      {
        path: '',
        name: 'Login',
        component: Login,
        meta: {
          title: '登录',
          hidden: true,
        },
      },
    ],
  },
  {
    path: '/404',
    component: NotFound,
    meta: {
      title: '404',
      hidden: true,
    },
  },
  {
    path: '/',
    component: BasicLayout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: Dashboard,
        meta: {
          title: '仪表盘',
          icon: 'dashboard',
          affix: true,
        },
      },
    ],
  },
  // 将匹配所有路径，放在最后
  {
    path: '/:pathMatch(.*)*',
    redirect: '/404',
    meta: {
      hidden: true,
    },
  },
]

// 动态路由，基于用户权限动态加载
export const asyncRoutes: RouteRecordRaw[] = [
  // 根据项目实际需求，后续添加
]

export default [...constantRoutes, ...asyncRoutes] 