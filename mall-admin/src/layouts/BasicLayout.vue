<template>
  <div class="basic-layout">
    <div class="sidebar" :class="{ 'collapsed': isCollapse }">
      <div class="logo">
        <h1>商城管理系统</h1>
      </div>
      <!-- 使用SideMenu组件 -->
      <SideMenu :routes="routes" :collapse="isCollapse" />
    </div>
    <div class="main-container">
      <div class="header">
        <div class="toggle-sidebar" @click="toggleSidebar">
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
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ArrowDown } from '@element-plus/icons-vue'
import SideMenu from '@/components/SideMenu.vue'
import { constantRoutes } from '@/router/routes'
import type { AdminInfo } from '@/api/admin'
import { RouteRecordRaw } from 'vue-router'

const router = useRouter()
const userStore = useUserStore()

// 用户信息
const userInfo = computed<AdminInfo | null>(() => userStore.userInfo)

// 侧边栏折叠状态
const isCollapse = ref(false)

// 路由列表
const routes = computed(() => {
  // 过滤掉不显示在菜单中的路由
  const filteredRoutes = filterRoutes(constantRoutes)
  return filteredRoutes
})

// 过滤掉不显示在菜单中的路由
const filterRoutes = (routes: RouteRecordRaw[]) => {
  console.log('Original routes:', routes);

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

  console.log('Filtered routes:', filtered);
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

  .sidebar {
    width: $sidebar-width;
    height: 100%;
    background-color: #304156;
    transition: width 0.3s;
    overflow: hidden;

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
      height: calc(100vh - #{$header-height});
    }
  }
}
</style>