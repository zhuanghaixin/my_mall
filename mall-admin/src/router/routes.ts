import { RouteRecordRaw } from 'vue-router'

// 布局组件
const BasicLayout = () => import('@/layouts/BasicLayout.vue')
const LoginLayout = () => import('@/layouts/LoginLayout.vue')

// 基础页面
const NotFound = () => import('@/views/error/404.vue')
const Login = () => import('@/views/login/index.vue')

// 商品管理
const ProductList = () => import('@/views/products/index.vue')
const ProductEdit = () => import('@/views/products/edit.vue')
const ProductCategory = () => import('@/views/products/category.vue')

// 订单管理
const OrderList = () => import('@/views/orders/index.vue')

// 用户管理
const UserList = () => import('@/views/users/index.vue')

// 轮播图管理
const BannerList = () => import('@/views/banner/index.vue')

// 系统设置
const SystemSettings = () => import('@/views/system/settings.vue')

// 基本路由，不需要权限的路由
export const constantRoutes: RouteRecordRaw[] = [
  {
    path: '/login',
    component: LoginLayout,
    meta: {
      title: '登录',
      hidden: true,
    },
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
    meta: {
      title: '仪表盘',
      icon: 'DataLine',
    },
    component: BasicLayout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/index.vue'),
        meta: {
          title: '仪表盘',
          icon: 'DataLine',
          // affix: true,
          hidden: true
        },
      },
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('@/views/profile/index.vue'),
        meta: {
          title: '个人中心',
          icon: 'User',
          hidden: true
        },
      },
    ],
  },
  // 商品管理
  {
    path: '/products',
    component: BasicLayout,
    redirect: '/products/list',
    meta: {
      title: '商品管理',
      icon: 'ShoppingBag',
    },
    children: [
      {
        path: 'list',
        name: 'ProductList',
        component: () => import('@/views/products/index.vue'),
        meta: {
          title: '商品列表',
          icon: 'List',
        },
      },
      {
        path: 'add',
        name: 'ProductAdd',
        component: () => import('@/views/products/edit.vue'),
        meta: {
          title: '新增商品',
          icon: 'Plus',
          hidden: true,
        },
      },
      {
        path: 'edit/:id',
        name: 'ProductEdit',
        component: () => import('@/views/products/edit.vue'),
        meta: {
          title: '编辑商品',
          icon: 'Edit',
          hidden: true,
        },
      },
      {
        path: 'category',
        name: 'ProductCategory',
        component: ProductCategory,
        meta: {
          title: '商品分类',
          icon: 'Folder',
        },
      },
    ],
  },
  // 订单管理
  {
    path: '/orders',
    component: BasicLayout,
    redirect: '/orders/list',
    meta: {
      title: '订单管理',
      icon: 'ShoppingCart',
    },
    children: [
      {
        path: 'list',
        name: 'OrderList',
        component: OrderList,
        meta: {
          title: '订单列表',
          icon: 'Document',
        },
      },
    ],
  },
  // 用户管理
  {
    path: '/users',
    component: BasicLayout,
    redirect: '/users/list',
    meta: {
      title: '用户管理',
      icon: 'User',
    },
    children: [
      {
        path: 'list',
        name: 'UserList',
        component: UserList,
        meta: {
          title: '用户列表',
          icon: 'UserFilled',
        },
      },
    ],
  },
  // 轮播图管理
  {
    path: '/banner',
    component: BasicLayout,
    redirect: '/banner/list',
    meta: {
      title: '轮播图管理',
      icon: 'Picture',
    },
    children: [
      {
        path: 'list',
        name: 'BannerList',
        component: BannerList,
        meta: {
          title: '轮播图列表',
          icon: 'PictureFilled',
        },
      },
    ],
  },
  // 系统设置
  {
    path: '/system',
    component: BasicLayout,
    redirect: '/system/settings',
    meta: {
      title: '系统设置',
      icon: 'Setting',
    },
    children: [
      {
        path: 'settings',
        name: 'SystemSettings',
        component: SystemSettings,
        meta: {
          title: '基本设置',
          icon: 'Tools',
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