<template>
    <div class="app-footer">
        <a href="http://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer">
            粤ICP备2025413181号
        </a>
    </div>
</template>

<script setup lang="ts">
// 备案信息底部组件
</script>

<style scoped lang="scss">
.app-footer {
    text-align: center;
    padding: 10px 0;
    color: #666;
    font-size: 14px;
    background-color: transparent;
    margin-top: auto;

    a {
        color: #666;
        text-decoration: none;

        &:hover {
            color: #409eff;
            text-decoration: underline;
        }
    }
}
</style>