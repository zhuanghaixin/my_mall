<template>
  <div class="basic-layout">
    <div class="sidebar">
      <!-- 左侧菜单组件，待开发 -->
      <div class="logo">
        <h1>商城管理系统</h1>
      </div>
      <!-- 菜单将在这里 -->
    </div>
    <div class="main-container">
      <div class="header">
        <!-- 顶部导航栏，待开发 -->
        <div class="right-menu">
          <el-dropdown>
            <span class="user-dropdown">
              管理员
              <el-icon><arrow-down /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item>个人信息</el-dropdown-item>
                <el-dropdown-item divided>退出登录</el-dropdown-item>
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
import { ArrowDown } from '@element-plus/icons-vue'

// BasicLayout组件逻辑待开发
</script>

<style scoped lang="scss">
.basic-layout {
  display: flex;
  height: 100vh;
  overflow: hidden;

  .sidebar {
    width: v-bind('$sidebar-width');
    height: 100%;
    background-color: #304156;
    transition: width 0.3s;

    .logo {
      height: 60px;
      line-height: 60px;
      text-align: center;
      color: #fff;
      font-size: 16px;
      overflow: hidden;
    }
  }

  .main-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;

    .header {
      height: v-bind('$header-height');
      padding: 0 20px;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      border-bottom: 1px solid #eee;

      .right-menu {
        display: flex;
        align-items: center;

        .user-dropdown {
          cursor: pointer;
          display: flex;
          align-items: center;
        }
      }
    }

    .app-main {
      flex: 1;
      padding: 20px;
      overflow: auto;
      background-color: #f0f2f5;
    }
  }
}
</style> 