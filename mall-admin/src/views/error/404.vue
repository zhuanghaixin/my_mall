<template>
  <div class="not-found">
    <div class="not-found-content">
      <h1>404</h1>
      <div class="info">抱歉，您访问的页面不存在</div>
      <router-link to="/">
        <el-button type="primary">返回首页</el-button>
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
// 404组件逻辑
</script>

<style scoped lang="scss">
.not-found {
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  
  .not-found-content {
    h1 {
      font-size: 100px;
      font-weight: bold;
      color: $primary-color;
      margin-bottom: 20px;
    }
    
    .info {
      font-size: 18px;
      color: $text-color-regular;
      margin-bottom: 20px;
    }
  }
}
</style> 