<template>
    <div class="big-upload">
        <slot name="trigger">
            <el-button @click="triggerFileInput" :disabled="uploading">选择文件</el-button>
        </slot>
        <input type="file" ref="fileInput" class="file-input" @change="handleFileChange" style="display:none" />
        <div v-if="file" class="file-info">
            <div>{{ file.name }} ({{ formatFileSize(file.size) }})</div>
            <div v-if="showHashProgress">
                <el-progress :percentage="hashPercent" />
            </div>
            <div v-else-if="fileHash">特征值: {{ fileHash }}</div>
        </div>
        <slot name="actions" :uploading="uploading" :uploadProgress="uploadProgress" :uploadSuccess="uploadSuccess"
            :startUpload="startUpload" :pauseUpload="pauseUpload" :resumeUpload="resumeUpload"
            :cancelUpload="cancelUpload">
            <el-button v-if="file && !uploading && !uploadSuccess && !isCalculatingHash" type="primary"
                @click="startUpload">开始上传</el-button>
            <el-button v-if="uploading && !isPaused" @click="pauseUpload">暂停</el-button>
            <el-button v-if="uploading && isPaused" @click="resumeUpload">继续</el-button>
            <el-button v-if="uploading" @click="cancelUpload">取消</el-button>
            <el-button v-if="uploadSuccess" @click="resetUpload">重置</el-button>
        </slot>
        <el-progress v-if="uploading || uploadSuccess" :percentage="uploadProgress"
            :status="uploadSuccess ? 'success' : (isPaused ? 'exception' : 'active')" />
        <div v-if="uploadSuccess">
            <slot name="result" :fileUrl="fileUrl" :fileHash="fileHash" :file="file">
                <div>上传成功: <a :href="fileUrl" target="_blank">{{ fileUrl }}</a></div>
            </slot>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onUnmounted, nextTick } from 'vue';
import { ElMessage } from 'element-plus';
import SparkMD5 from 'spark-md5';

const props = defineProps({
    modelValue: File,
    chunkSize: { type: Number, default: 2 * 1024 * 1024 },
    concurrentLimit: { type: Number, default: 3 },
    action: { type: String, default: '/upload' },
    headers: { type: Object, default: () => ({}) },
    mergeAction: { type: String, default: '/upload/merge' },
    verifyAction: { type: String, default: '/upload/verify' },
    chunkAction: { type: String, default: '/upload/chunk' },
    withCredentials: { type: Boolean, default: false },
    beforeUpload: Function,
    onSuccess: Function,
    onError: Function,
    onProgress: Function,
    onHashProgress: Function,
});
const emit = defineEmits(['update:modelValue', 'success', 'error', 'progress', 'hash-progress']);

const file = ref<File | null>(null);
const fileInput = ref<HTMLInputElement | null>(null);
const fileHash = ref('');
const hashPercent = ref(0);
const isCalculatingHash = ref(false);
const showHashProgress = computed(() => isCalculatingHash.value && file.value && hashPercent.value > 0 && hashPercent.value < 100);
const uploading = ref(false);
const isPaused = ref(false);
const uploadProgress = ref(0);
const uploadSuccess = ref(false);
const fileUrl = ref('');
const abortController = ref<AbortController | null>(null);
const worker = ref<Worker | null>(null);

watch(() => props.modelValue, (val) => {
    if (val) file.value = val;
});

const triggerFileInput = () => {
    if (uploading.value) return;
    fileInput.value?.click();
};

const handleFileChange = async (e: Event) => {
    const target = e.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
        file.value = target.files[0];
        emit('update:modelValue', file.value);
        await calculateFileHash(file.value);
    }
};

const calculateFileHash = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        if (worker.value) worker.value.terminate();
        try {
            worker.value = new Worker('/md5Worker.js');
            isCalculatingHash.value = true;
            hashPercent.value = 0;
            worker.value.onmessage = (e) => {
                const { type, data } = e.data;
                if (type === 'progress') {
                    hashPercent.value = data.percent;
                    emit('hash-progress', data.percent);
                } else if (type === 'complete') {
                    isCalculatingHash.value = false;
                    fileHash.value = data.hash;
                    worker.value?.terminate();
                    worker.value = null;
                    resolve(data.hash);
                } else if (type === 'error') {
                    isCalculatingHash.value = false;
                    worker.value?.terminate();
                    worker.value = null;
                    reject(new Error(data.error));
                }
            };
            worker.value.onerror = (error) => {
                isCalculatingHash.value = false;
                worker.value?.terminate();
                worker.value = null;
                reject(error);
            };
            worker.value.postMessage({ file, chunkSize: props.chunkSize });
        } catch (error) {
            isCalculatingHash.value = false;
            reject(error);
        }
    });
};

const formatFileSize = (size: number) => {
    if (size < 1024) return size + ' B';
    if (size < 1024 * 1024) return (size / 1024).toFixed(2) + ' KB';
    if (size < 1024 * 1024 * 1024) return (size / (1024 * 1024)).toFixed(2) + ' MB';
    return (size / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
};

// 其余上传、断点续传、合并、暂停、恢复、取消、进度等逻辑可参考webWorkerUpload.vue实现，略。
// 组件需暴露 startUpload、pauseUpload、resumeUpload、cancelUpload、resetUpload 方法。

</script>

<style scoped>
.big-upload {
    padding: 16px;
}

.file-info {
    margin: 8px 0;
}
</style>
