<template>
    <div class="mysql-ocp-container">
        <iframe src="/mysql/index.html" frameborder="0" class="mysql-iframe"></iframe>
    </div>
</template>

<script setup lang="ts">
// MySQL OCP 刷题系统 - 通过 iframe 嵌入
</script>

<style scoped lang="scss">
.mysql-ocp-container {
    width: 100%;
    height: calc(100vh - 60px);
    overflow: hidden;

    .mysql-iframe {
        width: 100%;
        height: 100%;
        border: none;
    }
}
</style>

