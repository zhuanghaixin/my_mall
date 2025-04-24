<template>
  <router-view />
  <EnvInfo />
</template>

<script setup lang="ts">
// 导入环境信息组件，仅在非生产环境中显示
import EnvInfo from './components/EnvInfo.vue';
import { EnvService } from './utils/env';

// 输出当前环境信息，便于调试
if (!EnvService.isProduction()) {
  console.log('当前环境:', EnvService.getEnvironment());
  console.log('环境变量:', EnvService.getAllEnvVars());
}
</script>

<style scoped>
/* 全局样式 */
</style> 