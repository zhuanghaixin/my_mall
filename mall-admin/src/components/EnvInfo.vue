<template>
  <div v-if="!isProduction" class="env-info">
    <span class="env-name" :class="environmentClass">{{ environment }}</span>
    <div class="env-details" v-if="showDetails">
      <p><strong>API URL:</strong> {{ apiUrl }}</p>
      <p><strong>Mock:</strong> {{ useMock ? '启用' : '禁用' }}</p>
      <p><strong>DevTools:</strong> {{ useDevTools ? '启用' : '禁用' }}</p>
    </div>
    <button class="toggle-btn" @click="toggleDetails">
      {{ showDetails ? '隐藏' : '显示' }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { EnvService } from '../utils/env';

// 环境信息
const environment = EnvService.getEnvironment();
const isProduction = EnvService.isProduction();
const apiUrl = EnvService.getApiUrl();
const useMock = EnvService.useMock();
const useDevTools = EnvService.useDevTools();

// 控制详情显示
const showDetails = ref(false);
const toggleDetails = () => {
  showDetails.value = !showDetails.value;
};

// 根据环境计算样式类
const environmentClass = computed(() => {
  switch (environment) {
    case 'development':
      return 'env-development';
    case 'test':
      return 'env-test';
    case 'staging':
      return 'env-staging';
    default:
      return '';
  }
});
</script>

<style scoped>
.env-info {
  position: fixed;
  bottom: 10px;
  right: 10px;
  background-color: rgba(255, 255, 255, 0.9);
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 8px;
  font-size: 12px;
  z-index: 9999;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  max-width: 300px;
}

.env-name {
  display: inline-block;
  padding: 2px 6px;
  border-radius: 3px;
  font-weight: bold;
  margin-right: 10px;
}

.env-development {
  background-color: #e6f7ff;
  color: #1890ff;
}

.env-test {
  background-color: #fff7e6;
  color: #fa8c16;
}

.env-staging {
  background-color: #f6ffed;
  color: #52c41a;
}

.env-details {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px dashed #ddd;
}

.env-details p {
  margin: 4px 0;
}

.toggle-btn {
  background-color: #f4f4f4;
  border: 1px solid #ddd;
  border-radius: 3px;
  padding: 2px 6px;
  font-size: 12px;
  cursor: pointer;
  margin-top: 5px;
}
</style> 