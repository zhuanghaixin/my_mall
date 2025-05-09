<template>
  <div class="basic-layout">
    <!-- 移动端菜单按钮 -->
    <div class="mobile-menu-button" v-if="isMobile" @click="toggleMobileMenu">
      <el-icon>
        <Menu />
      </el-icon>
    </div>

    <!-- 侧边栏导航 -->
    <div class="sidebar" :class="{ 'collapsed': isCollapse, 'mobile': isMobile, 'mobile-visible': mobileMenuVisible }">
      <div class="logo">
        <h1>商城管理系统</h1>
      </div>
      <!-- 使用SideMenu组件 -->
      <SideMenu :routes="routes" :collapse="isCollapse" />

      <!-- 移动端关闭按钮 -->
      <div class="mobile-close" v-if="isMobile" @click="closeMobileMenu">
        <el-icon>
          <Close />
        </el-icon>
      </div>
    </div>

    <!-- 移动端遮罩层 -->
    <div class="mobile-mask" v-if="isMobile && mobileMenuVisible" @click="closeMobileMenu"></div>

    <div class="main-container">
      <div class="header">
        <div class="toggle-sidebar" v-if="!isMobile" @click="toggleSidebar">
          <el-icon>
            <component :is="isCollapse ? 'Expand' : 'Fold'" />
          </el-icon>
        </div>
        <div class="right-menu">
          <el-dropdown @command="handleCommand">
            <span class="user-dropdown">
              {{ userInfo?.username || '管理员' }}
              <el-icon><arrow-down /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">个人信息</el-dropdown-item>
                <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
      <div class="app-main">
        <!-- 路由视图，展示当前路由对应的组件 -->
        <router-view />
      </div>
      <!-- 底部备案信息 -->
      <AppFooter />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ArrowDown, Menu, Close } from '@element-plus/icons-vue'
import SideMenu from '@/components/SideMenu.vue'
import { constantRoutes } from '@/router/routes'
import type { AdminInfo } from '@/api/admin'
import { RouteRecordRaw } from 'vue-router'
import AppFooter from '@/components/AppFooter.vue'

const router = useRouter()
const userStore = useUserStore()

// 用户信息
const userInfo = computed<AdminInfo | null>(() => userStore.userInfo)

// 侧边栏折叠状态
const isCollapse = ref(false)

// 移动端状态和菜单显示控制
const isMobile = ref(false)
const mobileMenuVisible = ref(false)

// 检查是否为移动设备
const checkMobile = () => {
  isMobile.value = window.innerWidth < 992
  // 在移动端下，默认折叠侧边栏
  if (isMobile.value) {
    isCollapse.value = true
  }
}

// 监听窗口尺寸变化
onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)

  // 监听菜单点击事件，关闭移动端菜单
  document.addEventListener('menu-click-mobile', closeMobileMenu)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
  document.removeEventListener('menu-click-mobile', closeMobileMenu)
})

// 监听移动设备状态变化
watch(isMobile, (newVal) => {
  if (newVal) {
    // 切换到移动端时关闭菜单
    mobileMenuVisible.value = false
  } else {
    // 切换到桌面端时恢复正常状态
    mobileMenuVisible.value = false
  }
})

// 切换移动端菜单
const toggleMobileMenu = () => {
  mobileMenuVisible.value = !mobileMenuVisible.value
}

// 关闭移动端菜单
const closeMobileMenu = () => {
  mobileMenuVisible.value = false
}

// 路由列表
const routes = computed(() => {
  // 过滤掉不显示在菜单中的路由
  const filteredRoutes = filterRoutes(constantRoutes)
  return filteredRoutes
})

// 过滤掉不显示在菜单中的路由
const filterRoutes = (routes: RouteRecordRaw[]) => {
  const filtered = routes.filter(route => {
    // 如果设置了meta.hidden为true，则不显示
    if (route.meta?.hidden) {
      return false;
    }

    // 1. 是根路由 或 2. 有子路由 或 3. 不是BasicLayout的路由
    return route.path === '/' ||
      (route.children && route.children.length > 0) ||
      (route.component && route.component.name !== 'BasicLayout');
  });

  return filtered;
}

// 切换侧边栏折叠状态
const toggleSidebar = () => {
  isCollapse.value = !isCollapse.value
}

// 处理下拉菜单命令
const handleCommand = (command: string) => {
  if (command === 'logout') {
    userStore.logout()
    router.push('/login')
  } else if (command === 'profile') {
    router.push('/profile')
  }
}
</script>

<style scoped lang="scss">
@use "@/assets/styles/variables.scss" as *;

.basic-layout {
  display: flex;
  height: 100vh;
  overflow: hidden;
  position: relative;

  // 移动端菜单按钮
  .mobile-menu-button {
    position: fixed;
    top: 10px;
    left: 10px;
    z-index: 1001;
    background-color: $primary-color;
    color: white;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    cursor: pointer;
  }

  // 移动端遮罩层
  .mobile-mask {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 998;
  }

  .sidebar {
    width: $sidebar-width;
    height: 100%;
    background-color: #304156;
    transition: all 0.3s ease;
    overflow: hidden;
    z-index: 999;

    .logo {
      height: $header-height;
      line-height: $header-height;
      text-align: center;
      color: #fff;
      font-size: 16px;
      overflow: hidden;
      white-space: nowrap;
      padding: 0 15px;

      h1 {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
      }
    }

    &.collapsed {
      width: $sidebar-collapse-width;

      .logo {
        padding: 0;

        h1 {
          display: none;
        }
      }
    }

    // 移动端样式
    &.mobile {
      position: fixed;
      left: -$sidebar-width;
      top: 0;
      bottom: 0;
      box-shadow: 2px 0 8px rgba(0, 0, 0, 0.15);

      &.mobile-visible {
        left: 0;
      }

      // 移动端关闭按钮
      .mobile-close {
        position: absolute;
        top: 10px;
        right: 10px;
        color: white;
        cursor: pointer;
        padding: 5px;

        .el-icon {
          font-size: 20px;
        }
      }
    }
  }

  .main-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;

    .header {
      height: $header-height;
      padding: 0 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid #eee;

      .toggle-sidebar {
        cursor: pointer;
        font-size: 20px;
        transition: background 0.3s;
        padding: 8px;
        border-radius: 4px;

        &:hover {
          background-color: rgba(0, 0, 0, 0.1);
        }
      }

      .right-menu {
        display: flex;
        align-items: center;
        margin-left: auto;

        .user-dropdown {
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 4px;
        }
      }
    }

    .app-main {
      flex: 1;
      padding: 20px;
      overflow: auto;
      background-color: #f0f2f5;
      position: relative;
      height: calc(100vh - #{$header-height} - 40px); // 减去footer高度
    }
  }
}

// 响应式适配
@media (max-width: $screen-md) {
  .basic-layout {
    .main-container {
      width: 100%;

      .header {
        padding: 0 15px;
      }
    }
  }
}

// 小屏幕安全区域适配
@supports (padding-bottom: env(safe-area-inset-bottom)) {
  .basic-layout .app-main {
    padding-bottom: calc(20px + env(safe-area-inset-bottom));

    @media (max-width: $screen-sm) {
      padding-bottom: calc(10px + env(safe-area-inset-bottom));
    }
  }
}
</style>