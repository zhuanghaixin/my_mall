<template>
    <div>
        <h2>大文件上传组件演示</h2>
        <BigUpload v-model="file" :chunk-size="2 * 1024 * 1024" :concurrent-limit="3" @success="onUploadSuccess"
            @error="onUploadError" @progress="onUploadProgress">
            <template #trigger>
                <el-button type="primary">自定义选择文件</el-button>
            </template>
            <template #result="{ fileUrl, fileHash, file }">
                <div>上传成功！文件地址：<a :href="fileUrl" target="_blank">{{ fileUrl }}</a></div>
                <div>文件特征值：{{ fileHash }}</div>
                <div>文件名：{{ file?.name }}</div>
            </template>
        </BigUpload>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import BigUpload from '@/components/BigUpload.vue';

const file = ref<File | undefined>(undefined);

const onUploadSuccess = (data: any) => {
    // 处理上传成功
    console.log('上传成功', data);
};
const onUploadError = (err: any) => {
    // 处理上传失败
    console.error('上传失败', err);
};
const onUploadProgress = (percent: number) => {
    // 处理进度
    console.log('上传进度', percent);
};
</script>

<style scoped lang="scss"></style>