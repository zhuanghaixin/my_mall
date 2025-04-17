<template>
  <div class="login-layout">
    <router-view />
  </div>
</template>

<script setup lang="ts">
// 登录布局组件逻辑
</script>

<style scoped lang="scss">
@use "@/assets/styles/variables.scss" as *;

.login-layout {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f0f2f5;
  background-image: url('@/assets/images/login-bg.svg');
  background-size: 100%;
  background-position: center;
}
</style>